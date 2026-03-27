"""Crisis pack common schemas — nodes, edges, branches."""
from typing import List, Literal, Optional
from pydantic import BaseModel, Field


ScenarioDomain = Literal[
    "aviation",
    "energy",
    "trade",
    "ecommerce",
    "macro",
    "social"
]

NodeType = Literal[
    "country",
    "airport",
    "airspace_zone",
    "refinery",
    "fuel_storage",
    "pipeline",
    "port",
    "airline",
    "cargo_route",
    "ecommerce_hub",
    "government_agency",
    "social_narrative",
    "price_signal",
    "disruption_event",
    "decision_action",
    "energy_production",
    "energy_refining",
    "energy_export",
    "energy_transmission",
    "maritime_chokepoint",
    "maritime_port",
    "financial_macro",
    "financial_liquidity",
    "financial_pricing",
    "utilities_power",
    "utilities_water",
    "utilities_telecom"
]

EdgeType = Literal[
    "affects",
    "depends_on",
    "reroutes_through",
    "supplies",
    "amplifies",
    "regulates",
    "insures",
    "delays",
    "substitutes",
    "stabilizes",
    "disrupts",
    "triggers",
    "shocks",
    "stresses",
    "feeds",
    "powers",
    "restricts",
    "supports",
    "from_production",
    "exports_to",
    "affects_export",
    "uses_port",
    "triggers_repricing",
    "erodes_confidence"
]


class CrisisNode(BaseModel):
    id: str
    label: str
    node_type: NodeType
    country: Optional[str] = None
    tags: List[str] = Field(default_factory=list)
    criticality: float = 0.5
    vulnerability: float = 0.5
    exposure: float = 0.5
    metadata: dict = Field(default_factory=dict)


class CrisisEdge(BaseModel):
    source: str
    target: str
    edge_type: EdgeType
    weight: float = 0.5
    metadata: dict = Field(default_factory=dict)


class ScenarioBranch(BaseModel):
    branch_id: str
    label: str
    description: str
    initial_weight: float
    triggers: List[str] = Field(default_factory=list)
