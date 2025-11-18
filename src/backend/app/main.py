from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum
import os
from .crud import ItemCRUD
from .models import Item, ItemCreate, ItemUpdate

app = FastAPI(title="CRUD API", root_path="/api")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
 
   allow_headers=["*"],
)

# Initialize CRUD operations
crud = ItemCRUD(
    table_name=os.getenv("DYNAMODB_TABLE", "app-data-table"),
    region=os.getenv("AWS_REGION", "ap-south-1")
)

@app.get("/")
async def root():
    return {"message": "CRUD API is running", "version": "1.0"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.post("/items", response_model=Item, status_code=201)
async def create_item(item: ItemCreate):
    try:
        return crud.create_item(item)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/items", response_model=list[Item])
async def list_items():
    try:
        return crud.list_items()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/items/{item_id}", response_model=Item)
async def get_item(item_id: str):
    item = crud.get_item(item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item

@app.put("/items/{item_id}", response_model=Item)
async def update_item(item_id: str, item: ItemUpdate):
    try:
        updated = crud.update_item(item_id, item)
        if not updated:
            raise HTTPException(status_code=404, detail="Item not found")
        return updated
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/items/{item_id}")
async def delete_item(item_id: str):
    success = crud.delete_item(item_id)
    if not success:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"message": "Item deleted successfully"}

# For AWS Lambda (optional)
handler = Mangum(app)
