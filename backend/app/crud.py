import boto3
from boto3.dynamodb.conditions import Key
from datetime import datetime
import uuid
from .models import ItemCreate, ItemUpdate, Item

class ItemCRUD:
    def __init__(self, table_name: str, region: str):
        self.dynamodb = boto3.resource('dynamodb', region_name=region)
        self.table = self.dynamodb.Table(table_name)
    
    def create_item(self, item: ItemCreate) -> Item:
        item_id = str(uuid.uuid4())
        created_at = datetime.utcnow().isoformat()
        
        item_data = {
            'id': item_id,
            'name': item.name,
            'description': item.description,
            'created_at': created_at
        }
        
        self.table.put_item(Item=item_data)
        return Item(**item_data)
    
    def get_item(self, item_id: str) -> Item | None:
        response = self.table.get_item(Key={'id': item_id})
        item_data = response.get('Item')
        
        if not item_data:
            return None
        
        return Item(**item_data)
    
    def list_items(self) -> list[Item]:
        response = self.table.scan()
        items = response.get('Items', [])
        
        # Sort by created_at descending
        items.sort(key=lambda x: x.get('created_at', ''), reverse=True)
        
        return [Item(**item) for item in items]
    
    def update_item(self, item_id: str, item: ItemUpdate) -> Item | None:
        # Check if item exists
        existing = self.get_item(item_id)
        if not existing:
            return None
        
        # Update item
        response = self.table.update_item(
            Key={'id': item_id},
            UpdateExpression='SET #name = :name, description = :description',
            ExpressionAttributeNames={'#name': 'name'},
            ExpressionAttributeValues={
                ':name': item.name,
                ':description': item.description
            },
            ReturnValues='ALL_NEW'
        )
        
        return Item(**response['Attributes'])
    
    def delete_item(self, item_id: str) -> bool:
        # Check if item exists
        existing = self.get_item(item_id)
        if not existing:
            return False
        
        self.table.delete_item(Key={'id': item_id})
        return True
