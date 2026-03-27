from __future__ import annotations

from typing import List

from pydantic import Field

from app.schemas.common import Assumption, ConfidenceMixin, DeevoBaseModel, MoneyRange, RiskLevel


class CustomerImpact(DeevoBaseModel):
    passenger_confidence_risk: float = Field(..., ge=0.0, le=1.0)
    churn_risk: float = Field(..., ge=0.0, le=1.0)


class DecisionComputeRequest(DeevoBaseModel):
    scenario_id: str
    simulation_response: dict


class DecisionOutput(ConfidenceMixin):
    scenario_id: str
    risk_level: RiskLevel
    risk_score: float = Field(..., ge=0.0, le=1.0)
    spread_velocity: float = Field(..., ge=0.0, le=1.0)
    primary_driver: str
    critical_window: str
    financial_impact: MoneyRange
    customer_impact: CustomerImpact
    regulatory_risk: float = Field(..., ge=0.0, le=1.0)
    reputation_score: float = Field(..., ge=0.0, le=1.0)
    recommended_actions: List[str] = Field(default_factory=list)
    assumptions: List[Assumption] = Field(default_factory=list)
