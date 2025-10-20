from fastapi import APIRouter, Request, HTTPException
from typing import Dict, Optional


# Create an API router to define game-related endpoints
router = APIRouter()


router.get("/chatbot")
def chatbot_page():
    return {
        "message": "Welcome to our chatbot."
    }