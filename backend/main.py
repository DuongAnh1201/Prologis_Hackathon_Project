from mimetypes import init
from fastapi import FastAPI
from routes.home import router as home_router
from routes.users import router as user_router 
from config.settings import initialize_state
from routes.Image_detection import router as image_router
from routes.search import router as search_router
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI(title="My App")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

initialize_state(app) 


# mount routers
app.include_router(home_router)
app.include_router(image_router)
app.include_router(user_router)
app.include_router(search_router)
