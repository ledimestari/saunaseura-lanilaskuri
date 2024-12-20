import os
from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from slowapi import Limiter
from slowapi.util import get_remote_address
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from dotenv import load_dotenv
from typing import List
from pydantic import BaseModel

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
    "http://localhost:3000",
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

class EventCreateRequest(BaseModel):
    event_name: str
    description: str

def api_key_header(authorization: HTTPAuthorizationCredentials = Depends(HTTPBearer())):
    return authorization.credentials

# Verify API Key
async def verify_api_key(authorization: HTTPAuthorizationCredentials = Depends(HTTPBearer())):
    api_key = authorization.credentials  # The API key is in the 'credentials' field
    if api_key != API_KEY:
        raise HTTPException(status_code=403, detail="Unauthorized: Invalid API Key")
    return api_key

# Verify password
async def verify_password(password: str):
    if password != SITE_PASSWORD:
        raise HTTPException(status_code=403, detail="Unauthorized: Invalid password")
    return password

# Health check endpoint
@app.get("/health")
@limiter.limit("10/minute")
async def health_check(request: Request, api_key: str = Depends(verify_api_key)):
    try:
        await db.command("ping")
        return {"status": "ok", "database": "connected"}
    except Exception as e:
        return {"status": "error", "database": "not connected", "details": str(e)}

# Auth check with both password and API key validation
@app.get("/auth")
@limiter.limit("10/minute")
async def check_password(request: Request, password: str, api_key: str = Depends(verify_api_key), verified_password: str = Depends(verify_password)):
    return {"status": "ok", "message": "Password and API key verified successfully"}

# Create an event
@app.post("/create_event/")
@limiter.limit("10/minute")
async def create_event(event_data: EventCreateRequest, request: Request, api_key: str = Depends(verify_api_key)):
    collection = db["events"]
    new_item = {"event_name": event_data.event_name, "description": event_data.description, "goods": []}
    result = await collection.insert_one(new_item)
    if result.inserted_id:
        return {"id": str(result.inserted_id)}
    raise HTTPException(status_code=500, detail="Failed to add event")

# Add item to event
@app.post("/add_item_to_event/")
async def add_item_to_event(event: str, item: str, price: float, payers: List[str], request: Request, api_key: str = Depends(verify_api_key)):
    collection = db["items"]
    new_item = {"event": event, "item": item, "price": price, "payers": payers}
    result = await collection.insert_one(new_item)
    if result.inserted_id:
        return {"id": str(result.inserted_id)}
    raise HTTPException(status_code=500, detail="Failed to add item")

# Get events
@app.get("/get_events/")
async def get_events(request: Request, api_key: str = Depends(verify_api_key)):
    collection = db["events"]
    items = await collection.find().to_list(100)
    events = []
    for item in items:
        item["_id"] = str(item["_id"])
        events.append(item)
    return events
