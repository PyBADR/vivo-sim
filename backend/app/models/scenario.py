from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


class Entity(BaseModel):
    """Entity model."""

    id: str
    name: str
    name_en: Optional[str] = None
    type: str
    weight: float


class Scenario(BaseModel):
    """Scenario domain model."""

    id: str
    title: str
    raw_text: str
    language: str
    country: Optional[str] = None
    category: Optional[str] = None
    created_at: datetime
    entities: List[Entity] = Field(default_factory=list)
