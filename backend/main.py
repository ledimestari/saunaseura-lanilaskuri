from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from motor.motor_asyncio import AsyncIOMotorClient

app = FastAPI()

# MongoDB client setup
client = AsyncIOMotorClient("mongodb://localhost:27017")
db = client.mydatabase
collection = db.mycollection

# Pydantic model for request body
class Item(BaseModel):
    name: str
    description: str = None
    price: float
    tax: float = None

@app.get("/")
def read_root():
    return {"Hello": "World"}
