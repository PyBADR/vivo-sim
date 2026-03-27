from __future__ import annotations

from typing import List, Optional

from pydantic import Field

from app.schemas.common import Assumption, ConfidenceMixin, DeevoBaseModel


class ForecastBlock(DeevoBaseModel):
    base_case: str
    pessimistic_case: str
    controlled_response_case: str


class BusinessImpactBlock(DeevoBaseModel):
    airports: str
    logistics: str
    tourism: str
    banking: str
    ecommerce: Optional[str] = None
    energy: Optional[str] = None


class BriefGenerateRequest(DeevoBaseModel):
    scenario_id: str
    decision_output: dict
    simulation_response: dict
    signals: List[dict] = Field(default_factory=list)


class IntelligenceBrief(ConfidenceMixin):
    scenario_id: str
    scenario_summary: str
    timeline_narrative: str
    key_drivers: List[str] = Field(default_factory=list)
    entity_influence: List[str] = Field(default_factory=list)
    forecast: ForecastBlock
    business_impact: BusinessImpactBlock
    recommended_actions: List[str] = Field(default_factory=list)
    assumptions: List[Assumption] = Field(default_factory=list)
