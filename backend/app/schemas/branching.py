"""Scenario branching schemas for Phase 2D.

B = {b_1, ..., b_k} with Σ p(b_i) = 1.
E[Y] = Σ p(b_i) Y(b_i).
Y_worst = max_i Y(b_i).
Y_best = min_i Y(b_i).
"""
from __future__ import annotations

from typing import List, Optional

from pydantic import Field, model_validator

from app.schemas.common import Assumption, ConfidenceMixin, DeevoBaseModel


class BranchOutcomeSummary(DeevoBaseModel):
    """Compact outcome summary for one scenario branch."""
    peak_risk_score: float = Field(..., ge=0.0, le=1.0, description="max total_risk_score across phases")
    final_risk_score: float = Field(..., ge=0.0, le=1.0, description="total_risk_score at terminal phase")
    peak_energy: float = Field(default=0.0, ge=0.0, description="E_max for this branch")
    spread_velocity: float = Field(default=0.0, ge=0.0, le=1.0)
    critical_window: str = Field(default="T0-T1")
    stabilization_phase: Optional[str] = Field(
        default=None,
        description="Phase label where risk began decreasing, or None if no stabilization",
    )


class ScenarioBranch(DeevoBaseModel):
    """One plausible scenario pathway.

    Each branch is a structurally different simulation path produced
    by modifying propagation parameters, edge weights, or intervention inputs.
    """
    branch_id: str
    branch_label: str = Field(..., description="Human-readable label: baseline / amplification / containment / adverse")
    branch_probability: float = Field(..., ge=0.0, le=1.0, description="p(b_i)")
    branch_trigger: str = Field(
        ...,
        description="What differentiates this branch (e.g. 'media amplification intensifies')",
    )
    assumptions: List[Assumption] = Field(default_factory=list)
    phase_risk_trajectory: List[float] = Field(
        default_factory=list,
        description="Total risk score per phase [r(T0), r(T1), ..., r(T5)]",
    )
    outcome: BranchOutcomeSummary


class BranchEnvelope(ConfidenceMixin):
    """Complete branching output — the scenario envelope.

    Contains all branches, expected/worst/best outcomes, and branch entropy.
    """
    scenario_id: str
    branches: List[ScenarioBranch] = Field(default_factory=list)
    expected_peak_risk: float = Field(
        default=0.0, ge=0.0, le=1.0,
        description="E[Y] = Σ p(b_i) Y_peak(b_i)",
    )
    worst_case_peak_risk: float = Field(
        default=0.0, ge=0.0, le=1.0,
        description="Y_worst = max_i Y_peak(b_i)",
    )
    best_case_peak_risk: float = Field(
        default=0.0, ge=0.0, le=1.0,
        description="Y_best = min_i Y_peak(b_i)",
    )
    branch_entropy: float = Field(
        default=0.0, ge=0.0,
        description="U_B = -Σ p(b_i) log p(b_i). Higher = more ambiguity.",
    )

    @model_validator(mode="after")
    def _validate_probability_sum(self):
        if self.branches:
            total = sum(b.branch_probability for b in self.branches)
            if abs(total - 1.0) > 0.02:
                raise ValueError(f"Branch probabilities must sum to ~1.0, got {total:.4f}")
        return self
