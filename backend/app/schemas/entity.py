from typing import Optional
from pydantic import BaseModel


class EntityOut(BaseModel):
    """Entity output schema."""

    id: str
    name: str
    name_en: Optional[str] = None
    type: str
    weight: float
