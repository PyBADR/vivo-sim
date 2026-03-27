from typing import List, Optional
from pydantic import BaseModel


class Agent(BaseModel):
    """Agent domain model."""

    id: str
    name: str
    name_en: Optional[str] = None
    archetype: str
    influence_score: float
    behavior_type: str
    platform: str
    sentiment: float
    activity_level: float


class Agents(BaseModel):
    """Agents collection model."""

    scenario_id: str
    agents: List[Agent] = []
