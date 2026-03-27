from __future__ import annotations

from typing import List, Optional

from pydantic import Field

from app.schemas.common import ConfidenceMixin, DeevoBaseModel, EdgeType, EntityType, Stance


class GraphNode(DeevoBaseModel):
    id: str
    label: str
    type: EntityType
    region: Optional[str] = None
    metadata: dict = Field(default_factory=dict)


class GraphEdge(DeevoBaseModel):
    source: str
    target: str
    type: EdgeType
    weight: float = Field(..., ge=0.0, le=1.0)
    metadata: dict = Field(default_factory=dict)


class GraphBuildRequest(DeevoBaseModel):
    scenario_id: str
    normalized_scenario: dict
    signals: List[dict] = Field(default_factory=list)


class GraphBuildResponse(ConfidenceMixin):
    scenario_id: str
    nodes: List[GraphNode] = Field(default_factory=list)
    edges: List[GraphEdge] = Field(default_factory=list)


class EnrichedGraphNode(GraphNode):
    influence_score: float = Field(..., ge=0.0, le=1.0)
    trust_score: float = Field(..., ge=0.0, le=1.0)
    propagation_score: float = Field(..., ge=0.0, le=1.0)
    stance: Stance = Stance.NEUTRAL


class GraphEnrichRequest(DeevoBaseModel):
    scenario_id: str
    nodes: List[GraphNode]
    edges: List[GraphEdge]
    signals: List[dict] = Field(default_factory=list)


class GraphEnrichResponse(ConfidenceMixin):
    scenario_id: str
    nodes: List[EnrichedGraphNode]
    edges: List[GraphEdge]
