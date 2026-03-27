from typing import Dict, List, Optional
from pydantic import BaseModel


class Node(BaseModel):
    """Graph node domain model."""

    id: str
    label: str
    label_en: Optional[str] = None
    type: str
    metadata: Dict = {}


class Edge(BaseModel):
    """Graph edge domain model."""

    id: str
    source: str
    target: str
    relation: str
    weight: float


class Graph(BaseModel):
    """Graph domain model."""

    scenario_id: str
    nodes: List[Node] = []
    edges: List[Edge] = []
