from __future__ import annotations

from typing import List, Optional

from pydantic import Field

from app.schemas.common import ConfidenceMixin, DeevoBaseModel, PhaseLabel, StrategyType


class AirportState(DeevoBaseModel):
    airport_code: str
    airspace_risk: float = Field(..., ge=0.0, le=1.0)
    reroute_severity: float = Field(..., ge=0.0, le=1.0)
    cancellation_risk: float = Field(..., ge=0.0, le=1.0)
    cargo_delay_risk: float = Field(..., ge=0.0, le=1.0)
    passenger_confidence_risk: float = Field(..., ge=0.0, le=1.0)
    composite_risk: float = Field(..., ge=0.0, le=1.0)


class SectorState(DeevoBaseModel):
    sector: str
    direct_impact: float = Field(..., ge=0.0, le=1.0)
    indirect_impact: float = Field(..., ge=0.0, le=1.0)
    composite_impact: float = Field(..., ge=0.0, le=1.0)


class MarketState(DeevoBaseModel):
    oil_stress: float = Field(..., ge=0.0, le=1.0)
    gold_stress: float = Field(..., ge=0.0, le=1.0)
    fx_stress: float = Field(..., ge=0.0, le=1.0)
    crypto_stress: float = Field(..., ge=0.0, le=1.0)
    shipping_stress: float = Field(..., ge=0.0, le=1.0)
    composite_market_stress: float = Field(..., ge=0.0, le=1.0)


class SimulationPhase(DeevoBaseModel):
    phase: PhaseLabel
    label: str
    airport_stress: float = Field(..., ge=0.0, le=1.0)
    shipping_stress: float = Field(..., ge=0.0, le=1.0)
    banking_stress: float = Field(..., ge=0.0, le=1.0)
    media_stress: float = Field(..., ge=0.0, le=1.0)
    public_stress: float = Field(..., ge=0.0, le=1.0)
    energy_stress: float = Field(..., ge=0.0, le=1.0)
    market_stress: float = Field(..., ge=0.0, le=1.0)
    logistics_stress: float = Field(..., ge=0.0, le=1.0)
    policy_stress: float = Field(..., ge=0.0, le=1.0)
    total_risk_score: float = Field(..., ge=0.0, le=1.0)
    key_events: List[str] = Field(default_factory=list)


class SimulationRunRequest(DeevoBaseModel):
    scenario_id: str
    normalized_scenario: dict
    signals: List[dict] = Field(default_factory=list)
    nodes: List[dict] = Field(default_factory=list)
    edges: List[dict] = Field(default_factory=list)
    agent_profiles: List[dict] = Field(default_factory=list)
    strategy: StrategyType = StrategyType.TRANSPARENT


class SimulationRunResponse(ConfidenceMixin):
    scenario_id: str
    phases: List[SimulationPhase] = Field(default_factory=list)
    airport_states: List[AirportState] = Field(default_factory=list)
    sector_states: List[SectorState] = Field(default_factory=list)
    market_state: Optional[MarketState] = None
    spread_velocity: float = Field(..., ge=0.0, le=1.0)
    critical_window: str
