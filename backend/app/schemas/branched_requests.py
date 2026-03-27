"""Request schemas for v2 branched endpoints (decision, brief, analysis).

These endpoints accept raw dicts for branch_envelope, intervention_set, and
uncertainty_envelope to avoid complex nested Pydantic validation. The endpoint
handlers reconstruct typed objects from dicts as needed.
"""
from __future__ import annotations

from typing import Any, Optional, List

from pydantic import Field

from app.schemas.common import DeevoBaseModel


class BranchedDecisionRequest(DeevoBaseModel):
    """Request for v2 branched decision computation."""
    scenario_id: str = Field(..., min_length=1)
    simulation_response: dict = Field(..., description="Raw simulation output dict")
    branch_envelope: Optional[dict] = Field(default=None, description="Optional branch envelope as dict")
    intervention_set: Optional[dict] = Field(default=None, description="Optional intervention set as dict")
    uncertainty_envelope: Optional[dict] = Field(default=None, description="Optional uncertainty envelope as dict")


class BranchedBriefRequest(DeevoBaseModel):
    """Request for v2 branched intelligence brief generation."""
    scenario_id: str = Field(..., min_length=1)
    decision_output: dict = Field(..., description="Raw decision output dict")
    simulation_response: dict = Field(..., description="Raw simulation output dict")
    signals: List[dict] = Field(default_factory=list, description="List of signal dicts")
    branch_envelope: Optional[dict] = Field(default=None, description="Optional branch envelope as dict")
    intervention_set: Optional[dict] = Field(default=None, description="Optional intervention set as dict")
    uncertainty_envelope: Optional[dict] = Field(default=None, description="Optional uncertainty envelope as dict")


class BranchedAnalysisRequest(DeevoBaseModel):
    """Request for v2 branched analysis query."""
    scenario_id: str = Field(..., min_length=1)
    question: str = Field(
        default="What is the best next action and why?",
        min_length=3,
        description="Analysis question to answer",
    )
    decision_output: dict = Field(..., description="Raw decision output dict")
    intelligence_brief: dict = Field(..., description="Raw intelligence brief dict")
    simulation_response: dict = Field(..., description="Raw simulation output dict")
    branch_envelope: Optional[dict] = Field(default=None, description="Optional branch envelope as dict")
    intervention_set: Optional[dict] = Field(default=None, description="Optional intervention set as dict")
    uncertainty_envelope: Optional[dict] = Field(default=None, description="Optional uncertainty envelope as dict")
