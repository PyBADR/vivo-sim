from typing import List
from pydantic import BaseModel


class ChatInput(BaseModel):
    """Input schema for chat."""

    question: str
    scenario_id: str


class ChatResponse(BaseModel):
    """Response schema for chat."""

    answer: str
    sources: List[str] = []
    confidence: float
