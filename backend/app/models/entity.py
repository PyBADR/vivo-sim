from typing import Optional
from pydantic import BaseModel


class EntityModel(BaseModel):
    """Entity domain model."""

    id: str
    name: str
    name_en: Optional[str] = None
    type: str
    weight: float
