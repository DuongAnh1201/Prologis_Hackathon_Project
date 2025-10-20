from fastapi import APIRouter, Request, HTTPException
from typing import Dict, Optional


# Create an API router to define game-related endpoints
router = APIRouter()


@router.get("/")
def home_page(request: Request):
    database = request.app.state.db
    receipt_data_collection = database["receipt_data"]

    cursor = receipt_data_collection.find({})
    
    return {
        "message": "Welcome to our app."
    }
