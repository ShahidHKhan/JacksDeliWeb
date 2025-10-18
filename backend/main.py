from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
from .database import Base, engine, SessionLocal
from . import models, schemas

# --- Database setup ---
Base.metadata.create_all(bind=engine)

# --- App setup ---
app = FastAPI(title="Jack's Deli API")

# Allow your frontend to call the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # (optional) you can restrict later to your site
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Dependency for database session ---
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# --- Routes ---

@app.get("/menu", response_model=list[schemas.MenuItemRead])
def list_menu(db: Session = Depends(get_db)):
    """List all menu items ordered by category."""
    return db.query(models.MenuItem).order_by(models.MenuItem.category).all()


@app.post("/menu", response_model=schemas.MenuItemRead, status_code=201)
def add_menu_item(item: schemas.MenuItemCreate, db: Session = Depends(get_db)):
    """Add a new menu item."""
    m = models.MenuItem(**item.model_dump())
    db.add(m)
    db.commit()
    db.refresh(m)
    return m


@app.delete("/menu/{item_id}", status_code=204)
def delete_menu_item(item_id: int, db: Session = Depends(get_db)):
    """Delete a menu item by ID."""
    m = db.get(models.MenuItem, item_id)
    if not m:
        raise HTTPException(status_code=404, detail="Item not found")
    db.delete(m)
    db.commit()


@app.get("/menu/search", response_model=list[schemas.MenuItemRead])
def search_menu(
    query: str = Query(..., min_length=1, description="Search term"),
    db: Session = Depends(get_db)
):
    """
    Case-insensitive substring search for menu item names.
    Works reliably in MySQL by using LOWER() comparison.
    """
    like_pattern = f"%{query.lower()}%"
    results = (
        db.query(models.MenuItem)
        .filter(func.lower(models.MenuItem.name).like(like_pattern))
        .all()
    )
    return results
