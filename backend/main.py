import os
from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security.api_key import APIKeyHeader
from slowapi import Limiter
from slowapi.util import get_remote_address
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from dotenv import load_dotenv
from typing import List

# Setup env variables for api key
load_dotenv()
API_KEY = os.getenv("API_KEY")
api_key_header = APIKeyHeader(name="X-API-Key")

app = FastAPI()

# Create limiter to limit requests
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

# Define allowed origins for requests (CORS is enforced by browsers only, not servers. Additional auth may be needed.)
origins = [
    "https://nuc.ihanakangas.fi",
    "http://nuc.ihanakangas.fi",
    "http://localhost:3000"
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

async def verify_api_key(api_key: str = Depends(api_key_header)):
    if api_key != API_KEY:
        raise HTTPException(status_code=403, detail="Unauthorized: Invalid API Key")
    return api_key

@app.get("/health")
@limiter.limit("5/minute")
async def health_check(request: Request, api_key: str = Depends(verify_api_key)):
    try:
        await db.command("ping")  # Check database connectivity
        return {"status": "ok", "database": "connected"}
    except Exception as e:
        return {"status": "error", "database": "not connected", "details": str(e)}

@app.post("/create_event/")
@limiter.limit("5/minute")
async def create_event(event_name: str, description: str, request: Request, api_key: str = Depends(verify_api_key)):
    collection = db["events"]
    new_item = {"event_name": event_name, "description": description, "goods": []}
    result = await collection.insert_one(new_item)
    if result.inserted_id:
        return {"id": str(result.inserted_id)}
    raise HTTPException(status_code=500, detail="Failed to add event")

@app.post("/add_item_to_event/")
async def add_item_to_event(event: str, item: str, price: float, payers: List[str], request: Request, api_key: str = Depends(verify_api_key)):
    collection = db["items"]
    new_item = {"name": name, "description": description}
    result = await collection.insert_one(new_item)
    if result.inserted_id:
        return {"id": str(result.inserted_id)}
    raise HTTPException(status_code=500, detail="Failed to add item")

@app.get("/get_events/")
async def get_events(request: Request, api_key: str = Depends(verify_api_key)):
    collection = db["events"]
    items = await collection.find().to_list(100)
    # Convert MongoDB documents to JSON-serializable format
    events = []
    for item in items:
        item["_id"] = str(item["_id"])
        events.append(item)
    
    return events
