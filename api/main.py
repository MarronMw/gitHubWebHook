from typing import Union
from fastapi import FastAPI

# In app imports
from models.Models import Issue

# initializing the application
app = FastAPI()

# Routes definition


# Default route
@app.get('/')
# Use 'async def' for asynchronous functions
def read_root():
    return {"Message": "Hello World !"}


# Get a specific issue
@app.get("/issues/{issue_id}")
def read_issue(issue_id: int, q: Union[str, None] = None):
    return {'issue_id': issue_id, "q": q}


# edit an issue
@app.put('/issues/{issue_id}')
def update_issue(issue_id: int, issue: Issue):
    return {"issue_title": issue.title, "issue_description": issue.description, "issue_priority ": issue.impact}
