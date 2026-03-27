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


class MaritimeTradeImpact(BaseModel):
    chokepoint_pressure: float
    port_delay: float
    insurance_cost_surge: float
    rerouting_stress: float
    maritime_trade_score: float


class FinancialStressImpact(BaseModel):
    oil_volatility: float
    liquidity_stress: float
    sentiment_shock: float
    insurance_repricing: float
    market_stress_score: float


class SupplyChainImpact(BaseModel):
    food_imports_stress: float
    medicine_supply_stress: float
    airport_cargo_stress: float
    last_mile_pressure: float
    supply_chain_score: float


class SocialResponseImpact(BaseModel):
    panic_buying: float
    media_amplification: float
    trust_loss: float
    official_stabilization: float
    public_reaction_score: float


class NodeImpact(BaseModel):
    node_id: str
    label: str
    node_type: str
    probability_of_disruption: float
    severity_score: float
    time_to_impact_hours: Optional[float] = None
    ripple_effect: List[str] = Field(default_factory=list)
    country: Optional[str] = None
    tags: Optional[List[str]] = None


class ExecutiveActionBundle(BaseModel):
    primary_action: str
    secondary_actions: List[str] = Field(default_factory=list)
    top_risks: List[str] = Field(default_factory=list)
    top_nodes: List[str] = Field(default_factory=list)
    decision_summary: str


class CrisisAssessment(BaseModel):
    scenario_id: str
    branch_id: Optional[str] = None
    airport_impacts: List[AirportImpact] = Field(default_factory=list)
    energy_impact: Optional[EnergyImpact] = None
    ecommerce_impact: Optional[ECommerceImpact] = None
    propagation: List[PropagationStep] = Field(default_factory=list)
    ranked_actions: List[RankedAction] = Field(default_factory=list)
    node_impacts: Optional[List[NodeImpact]] = None
    maritime_trade_impact: Optional[MaritimeTradeImpact] = None
    financial_stress_impact: Optional[FinancialStressImpact] = None
    supply_chain_impact: Optional[SupplyChainImpact] = None
    social_response_impact: Optional[SocialResponseImpact] = None
    executive_action_bundle: Optional[ExecutiveActionBundle] = None
    summary: str
