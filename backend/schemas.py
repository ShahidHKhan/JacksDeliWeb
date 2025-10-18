# backend/schemas.py
from pydantic import BaseModel, Field
from enum import Enum

class CategoryEnum(str, Enum):
    Halal = "Halal"
    NonHalal = "Non-Halal"

class MenuItemBase(BaseModel):
    name: str = Field(..., example="Chicken Gyro")
    category: CategoryEnum = Field(..., example="Halal")
    spice: str = Field(default="Mild", example="Hot")
    price_cents: int = Field(..., example=1099)

class MenuItemCreate(MenuItemBase):
    pass

class MenuItemRead(MenuItemBase):
    id: int
    class Config:
        from_attributes = True  # pydantic v2 version of orm_mode
