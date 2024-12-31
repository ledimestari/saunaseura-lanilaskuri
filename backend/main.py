import os
import shutil
from fastapi import FastAPI, HTTPException, Depends, Request, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import JSONResponse
from slowapi import Limiter
from slowapi.util import get_remote_address
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from dotenv import load_dotenv
from typing import List
from pydantic import BaseModel
from receipt_parser import handle_receipt
from datetime import datetime, timedelta
import uuid
import secrets

# Setup env variables for api key
load_dotenv()
API_KEY = os.getenv("API_KEY")
SITE_PASSWORD = os.getenv("SITE_PASSWORD")

app = FastAPI()

# Create limiter to limit requests
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

# Define allowed origins for requests (CORS is enforced by browsers only, not servers. Additional auth may be needed.)
origins = [
    "https://nuc.ihanakangas.fi",
    "http://nuc.ihanakangas.fi",
    "http://localhost:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB configuration
MONGO_URI = "mongodb://localhost:27017"
DATABASE_NAME = "saunaseura-lanilaskuri"

client = AsyncIOMotorClient(MONGO_URI)
db = client[DATABASE_NAME]
TOKENS = {} # Move token storage to db
TOKEN_EXPIRATION = timedelta(hours=1)


class EventCreateRequest(BaseModel):
    event_name: str
    description: str

class Item(BaseModel):
    item: str
    price: float
    payers: List[str]
    id: str


# Create token for frontend
def create_token():
    return secrets.token_hex(16)

# Validate token on every api call
def validate_token(request: Request):
    token = request.headers.get("Authorization")
    if not token:
        raise HTTPException(status_code=401, detail="Unauthorized: Token missing")

    token = token.replace("Bearer ", "")

    # Check if the token is in the dictionary and if it is expired
    if token not in TOKENS or TOKENS[token] < datetime.utcnow():
        TOKENS.pop(token, None)  # Remove expired or invalid token from TOKENS
        raise HTTPException(status_code=401, detail="Unauthorized: Invalid or expired token")

    return token
# Health check endpoint
@app.get("/health")
@limiter.limit("10/minute")
async def health_check(request: Request):
    try:
        await db.command("ping")
        return {"status": "ok", "database": "connected"}
    except Exception as e:
        return {"status": "error", "database": "not connected", "details": str(e)}


# Auth check, return token if password is correct. Token is checked against in queries.
@app.get("/auth")
@limiter.limit("10/minute")
async def check_password(request: Request, password: str):
    if password != SITE_PASSWORD:
        raise HTTPException(status_code=401, detail="Unauthorized: Invalid password")
    
    token = create_token()
    TOKENS[token] = datetime.utcnow() + TOKEN_EXPIRATION
    return {"token": token}


# Create an event
# TODO: Add handling of duplicate naming
# TODO: Add handling of too long descriptions
@app.post("/create_event/")
@limiter.limit("10/minute")
async def create_event(event_data: EventCreateRequest, request: Request, token: str = Depends(validate_token)):
    collection = db["events"]
    new_item = {"event_name": event_data.event_name, "description": event_data.description, "goods": []}
    result = await collection.insert_one(new_item)
    if result.inserted_id:
        return {"id": str(result.inserted_id)}
    raise HTTPException(status_code=500, detail="Failed to add event")


# Add item to event
@app.post("/add_item_to_event/")
@limiter.limit("30/minute")
async def add_item_to_event(event: str, item: str, price: float, payers: List[str], request: Request, token: str = Depends(validate_token)):
    collection = db["events"]
    event_document = await collection.find_one({"event_name": event})
    if not event_document:
        raise HTTPException(status_code=404, detail="Event not found")
    new_item = {"item": item, "price": price, "payers": payers, "id": str(uuid.uuid4())}
    update_result = await collection.update_one(
        {"event_name": event},
        {"$push": {"goods": new_item}}
    )
    if update_result.modified_count > 0:
        return {"status": "success", "message": "Item added to event successfully"}
    raise HTTPException(status_code=500, detail="Failed to add item")


# Add multiple items to event
@app.post("/add_items_to_event/")
@limiter.limit("10/minute")
async def add_item_to_event(
    event: str, 
    items: List[Item], 
    request: Request, 
    token: str = Depends(validate_token)
):
    
    collection = db["events"]
    event_document = await collection.find_one({"event_name": event})
    
    if not event_document:
        raise HTTPException(status_code=404, detail="Event not found")
    
    for row in items:
        
        try:
            price = float(row.price)
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid price value: {row.price}")

        new_item = {"item": row.item, "price": price, "payers": row.payers, "id": row.id}
        
        update_result = await collection.update_one(
            {"event_name": event},
            {"$push": {"goods": new_item}}
        )
        
        if update_result.modified_count == 0:
            raise HTTPException(status_code=500, detail=f"Failed to add item {row.item}")
    
    return {"status": "success", "message": "Items added to event successfully"}


# Get event names and IDs
@app.get("/get_events/")
@limiter.limit("40/minute")
async def get_events(request: Request, token: str = Depends(validate_token)):
    collection = db["events"]
    items = await collection.find().to_list(100)
    events = []
    for item in items:
        events.append({
            "id": str(item["_id"]),
            "event_name": item["event_name"],
            "description": item["description"]
        })
    return events


# Get goods in events
@app.get("/get_event_goods/")
@limiter.limit("40/minute")
async def get_event_goods(event: str, request: Request, token: str = Depends(validate_token)):
    collection = db["events"]
    event_document = await collection.find_one({"event_name": event})
    if not event_document:
        raise HTTPException(status_code=404, detail="Event not found")
    goods = event_document.get("goods", [])
    
    return goods


# Remove item from event
@app.delete("/remove_item_from_event/")
@limiter.limit("40/minute")
async def remove_item_from_event(event: str, id: str, request: Request, token: str = Depends(validate_token)):
    collection = db["events"]
    event_document = await collection.find_one({"event_name": event})
    if not event_document:
        raise HTTPException(status_code=404, detail="Event not found")
    
    # Attempt to remove the item from the goods array
    update_result = await collection.update_one(
        {"event_name": event},
        {"$pull": {"goods": {"id": id,}}}
    )
    
    if update_result.modified_count > 0:
        return {"status": "success", "message": "Item removed from event successfully"}
    
    raise HTTPException(status_code=404, detail="Item not found in event")

# Update an item in an event
@app.put("/update_item_in_event/")
@limiter.limit("40/minute")
async def update_item_in_event(
    event: str,
    item_id: str,
    new_item: str,
    new_price: float,
    new_payers: List[str],
    request: Request,
    token: str = Depends(validate_token)
):
    collection = db["events"]
    event_document = await collection.find_one({"event_name": event})

    if not event_document:
        raise HTTPException(status_code=404, detail="Event not found")

    update_fields = {}
    update_fields["goods.$.item"] = new_item
    update_fields["goods.$.price"] = new_price
    update_fields["goods.$.payers"] = new_payers

    update_result = await collection.update_one(
        {"event_name": event, "goods.id": item_id},
        {"$set": update_fields}
    )

    if update_result.modified_count > 0:
        return {"status": "success", "message": "Item updated successfully"}
    
    raise HTTPException(status_code=500, detail="Failed to update item")

# Handle the receipt and parse all items from it
@app.post("/process-receipt/")
@limiter.limit("10/minute")
async def process_file(request: Request, token: str = Depends(validate_token), file: UploadFile = File(...) ):
    allowed_extensions = {"png", "jpg", "jpeg", "pdf"}
    file_extension = file.filename.split(".")[-1].lower()
    if file_extension not in allowed_extensions:
        raise HTTPException(
            status_code=400, 
            detail=f"Unsupported file type: {file_extension}. Allowed types: {allowed_extensions}"
        )

    # Save the file temporarily
    temp_file_path = f"temp_{file.filename}"
    with open(temp_file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        result = handle_receipt(temp_file_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")
    finally:
        os.remove(temp_file_path)

    return JSONResponse(result)
