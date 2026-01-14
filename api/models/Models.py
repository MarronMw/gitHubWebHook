from typing import Literal, Optional, Union
from pydantic import BaseModel

# These models can act as external types to the Python applicaion server


# Issues Model
class Issue(BaseModel):
    title: str
    description: str
    impact: Optional[Literal["low", "medium", "high"]]
