from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from pydantic import Field

from app.schemas.common import (
    Assumption,
    ConfidenceMixin,
    ConstraintType,
    DeevoBaseModel,
    Domain,
    Horizon,
    Region,
    TriggerType,
)


class ScenarioNormalizeRequest(DeevoBaseModel):
    raw_text: str = Field(..., min_length=10, description="Raw user or system scenario text")
    region_hint: Optional[Region] = None
    domain_hint: Optional[Domain] = None
    preferred_horizon: Optional[Horizon] = None
    source_refs: List[str] = Field(default_factory=list)


class ScenarioTrigger(DeevoBaseModel):
    type: TriggerType
    label: str
    severity: float = Field(..., ge=0.0, le=1.0)
    timestamp: datetime


class ScenarioConstraint(DeevoBaseModel):
    type: ConstraintType
    active: bool = True
    details: str
    severity: float = Field(..., ge=0.0, le=1.0)


class NormalizedScenario(ConfidenceMixin):
    scenario_id: str
    title: str
    raw_text: str
    region: Region
    domain: Domain
    trigger: ScenarioTrigger
    actors: List[str] = Field(default_factory=list)
    signal_categories: List[str] = Field(default_factory=list)
    constraints: List[ScenarioConstraint] = Field(default_factory=list)
    time_horizon_hours: int = Field(..., ge=1, le=720)
    assumptions: List[Assumption] = Field(default_factory=list)


class ScenarioSummary(ConfidenceMixin):
    scenario_id: str
    title: str
    region: Region
    domain: Domain
    trigger_type: TriggerType
    time_horizon_hours: int
