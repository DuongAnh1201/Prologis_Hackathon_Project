from pydantic import BaseModel
from datetime import datetime 
from typing import Optional

class ReceiptData(BaseModel):
    user_id: str
    user_name: str  
    name: str 
    quantity: int
    price: float 
    drop_off_location: str 
    pick_up_location: str 
    pick_up_time: Optional[datetime] = None
    drop_off_time: Optional[datetime] = None 
    