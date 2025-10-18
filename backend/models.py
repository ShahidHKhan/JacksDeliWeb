from sqlalchemy import Column, Integer, String, Enum, UniqueConstraint
from .database import Base
import enum

from sqlalchemy import Column, Integer, String

class MenuItem(Base):
    __tablename__ = "menu_items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    category = Column(String(50), nullable=False)  # ✅ changed from Enum to plain String
    spice = Column(String(50))
    price_cents = Column(Integer, nullable=False)


