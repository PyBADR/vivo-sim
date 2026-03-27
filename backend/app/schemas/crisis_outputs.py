"""Crisis assessment output schemas."""
from typing import List, Dict, Optional
from pydantic import BaseModel, Field


class AirportImpact(BaseModel):
    airport_code: str
    airport_name: str
    rerouting_pressure: float
    fuel_stress: float
    congestion_pressure: float
    insurance_operating_stress: float
    disruption_score: float


class EnergyImpact(BaseModel):
    oil_shock: float
    refining_stress: float
    logistics_delay: float
    fuel_impact_score: float


class ECommerceImpact(BaseModel):
    delay: float
    inventory_stress: float
    demand_volatility: float
    payment_friction: float
    ecommerce_disruption_score: float


class PropagationStep(BaseModel):
    step: int
    node_scores: Dict[str, float]
    total_energy: float


class RankedAction(BaseModel):
    action_id: str
    label: str
    risk_reduction: float
    feasibility: float
    timeliness: float
    cost: float
    second_order_risk: float
    action_score: float
    rationale: str


class CrisisAssessment(BaseModel):
    scenario_id: str
    branch_id: Optional[str] = None
    airport_impacts: List[AirportImpact] = Field(default_factory=list)
    energy_impact: Optional[EnergyImpact] = None
    ecommerce_impact: Optional[ECommerceImpact] = None
    propagation: List[PropagationStep] = Field(default_factory=list)
    ranked_actions: List[RankedAction] = Field(default_factory=list)
    summary: str
