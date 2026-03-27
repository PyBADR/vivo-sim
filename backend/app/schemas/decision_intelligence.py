"""Decision Intelligence output schemas.

Transforms crisis assessment from impact monitoring
into actionable decision intelligence for GCC executives.
"""
from typing import List, Optional
from pydantic import BaseModel, Field


class DecisionOption(BaseModel):
    option_id: str
    title: str
    description: str
    risk_reduction: float = Field(ge=0, le=1)
    cost_estimate: str
    time_to_implement: str
    confidence: float = Field(ge=0, le=1)
    trade_offs: List[str] = Field(default_factory=list)
    dependencies: List[str] = Field(default_factory=list)
    recommendation: str  # "strongly_recommended" | "recommended" | "conditional" | "not_recommended"


class DecisionWindow(BaseModel):
    window_id: str
    title: str
    opens: str  # e.g., "T+0h"
    closes: str  # e.g., "T+6h"
    urgency: str  # "critical" | "high" | "medium" | "low"
    actions_available: List[str] = Field(default_factory=list)
    cost_of_delay: str


class CriticalNode(BaseModel):
    node_id: str
    label: str
    node_type: str
    criticality_score: float = Field(ge=0, le=1)
    cascade_risk: float = Field(ge=0, le=1)
    downstream_count: int
    intervention_options: List[str] = Field(default_factory=list)
    country: Optional[str] = None


class ExecutiveNarrative(BaseModel):
    situation: str
    implications: List[str] = Field(default_factory=list)
    recommended_actions: List[str] = Field(default_factory=list)
    confidence_statement: str
    decision_deadline: str


class ConfidenceBand(BaseModel):
    metric: str
    lower_bound: float
    central_estimate: float
    upper_bound: float
    confidence_level: float = Field(ge=0, le=1)


class DecisionIntelligenceBundle(BaseModel):
    scenario_id: str
    decision_options: List[DecisionOption] = Field(default_factory=list)
    decision_windows: List[DecisionWindow] = Field(default_factory=list)
    critical_nodes: List[CriticalNode] = Field(default_factory=list)
    executive_narrative: Optional[ExecutiveNarrative] = None
    confidence_bands: List[ConfidenceBand] = Field(default_factory=list)
    overall_confidence: float = Field(ge=0, le=1, default=0.0)
