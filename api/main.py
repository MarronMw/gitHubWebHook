from typing import Union
from fastapi import FastAPI

# initializing the application
app = FastAPI()

# Routes definition


# Default route
@app.get('/')
# Use 'async def' for asynchronous functions
def read_root():
    return {"Message": "Hello World !"}


# Get a specific item
@app.get()
def read_item(item_id: int, q: Union[str, None] = None):
    return {'item_id': item_id, "q": q}
