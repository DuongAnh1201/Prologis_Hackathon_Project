from fastapi import FastAPI
import os
from fastapi.middleware.cors import CORSMiddleware
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from dotenv import load_dotenv

load_dotenv()

# Getting MONGODB URI from .env file
MONGO_URI = os.getenv("MONGODB_URI")

# Database connection will be initialized lazily
client = None
db = None

def get_database():
    """Get database connection, initialize if needed"""
    global client, db
    if client is None and MONGO_URI:
        try:
            client = MongoClient(MONGO_URI, server_api=ServerApi('1'))
            db = client["BFB"]
        except Exception as e:
            print(f"Warning: Could not connect to MongoDB: {e}")
            return None
    return db

# Allowed frontend origins
ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174", 
    "http://127.0.0.1:5174",
    "http://172.16.9.92:5173",
    "https://stellular-pothos-36699a.netlify.app/"
]

# Function: configure_cors
# Purpose: Enables CORS middleware to allow requests from frontend
def configure_cors(app: FastAPI):
    """
    Configures Cross-Origin Resource Sharing (CORS) middleware for the FastAPI application.
    
    This allows the backend API to accept requests from specified frontend origins,
    which is essential for browser-based applications to communicate with the API.
    
    Args:
        app (FastAPI): The FastAPI application instance to configure
        
    CORS Settings:
        - allow_origins: List of allowed frontend URLs
        - allow_credentials: Enables cookies/auth headers in cross-origin requests
        - allow_methods: ["*"] allows all HTTP methods (GET, POST, PUT, DELETE, etc.)
        - allow_headers: ["*"] allows all headers in requests
    """
    app.add_middleware(
        CORSMiddleware,
        allow_origins=ALLOWED_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Function: initialize_state
def initialize_state(app: FastAPI):
    """
    Initializes the FastAPI application state with database connections and caching structures.
    
    This function sets up:
    1. Database connection in app state for access across endpoints
    2. User seen map for tracking which games users have viewed
    3. MongoDB indexes for optimized query performance
    
    Args:
        app (FastAPI): The FastAPI application instance to initialize
        
    State Variables:
        - app.state.db: MongoDB database instance
        - app.state.user_seen_map: Dict mapping usernames to sets of seen game IDs
    """
    app.state.db = get_database()        # initializing database
    app.state.seen_map = {}              # key: username, value: set of seen game IDs
