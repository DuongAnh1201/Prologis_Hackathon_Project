from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel

router = APIRouter()

class LoginRequest(BaseModel):
    username: str
    password: str

@router.post("/login")
async def login(credentials: LoginRequest, request: Request):
    user_collection = request.app.state.db["users"]
    
    # Find user in MongoDB
    user = user_collection.find_one({
        "username": credentials.username,
        "password": credentials.password
    })
    
    if user:
        return {
            "message": "Login successful", 
            "username": credentials.username
        }
    else:
        raise HTTPException(status_code=401, detail="Invalid credentials")