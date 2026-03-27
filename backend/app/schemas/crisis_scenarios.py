"""Crisis scenario pack schema."""
from typing import List, Dict
from pydantic import BaseModel, Field
from app.schemas.crisis_common import CrisisNode, CrisisEdge, ScenarioBranch


class ScenarioPack(BaseModel):
    scenario_id: str
    title: str
    description: str
    region: str = "GCC"
    categories: List[str] = Field(default_factory=list)
    airports: List[str] = Field(default_factory=list)
    nodes: List[CrisisNode] = Field(default_factory=list)
    edges: List[CrisisEdge] = Field(default_factory=list)
    branches: List[ScenarioBranch] = Field(default_factory=list)
    base_weights: Dict[str, float] = Field(default_factory=dict)
