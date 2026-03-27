from __future__ import annotations

from typing import List

from pydantic import Field

from app.schemas.common import ConfidenceMixin, DeevoBaseModel


class AnalysisQueryRequest(DeevoBaseModel):
    scenario_id: str
    question: str = Field(..., min_length=3)
    decision_output: dict
    intelligence_brief: dict
    simulation_response: dict


class AnalysisQueryResponse(ConfidenceMixin):
    scenario_id: str
    answer: str
    top_drivers: List[str] = Field(default_factory=list)
    top_entities: List[str] = Field(default_factory=list)
    counterfactuals: List[str] = Field(default_factory=list)
