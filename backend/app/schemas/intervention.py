"""Intervention schemas for Phase 2D.

Interventions are first-class objects that alter propagation dynamics.

u_i(t) = Γ(i_k, v_i, t)   — intervention effect on node i at time t
ΔE(i_k) = E_baseline_max - E_intervened_max   — peak reduction
Eff(i_k) = ΔE(i_k) / (Cost(i_k) + ε)         — cost-efficiency
DelayLoss(i_k, τ) = E_max(at τ) - E_max(at 0) — timing sensitivity
"""
from __future__ import annotations

from typing import List, Optional

from pydantic import Field

from app.schemas.common import ConfidenceMixin, DeevoBaseModel


class InterventionTarget(DeevoBaseModel):
    """Specifies which nodes or edges an intervention affects."""
    target_node_ids: List[str] = Field(default_factory=list)
    target_edge_types: List[str] = Field(default_factory=list)
    effect_type: str = Field(
        ...,
        description="'dampen_node' | 'boost_node' | 'reduce_edge' | 'amplify_edge'",
    )
    magnitude: float = Field(
        ..., ge=0.0, le=1.0,
        description="Strength of intervention effect (0 = no effect, 1 = maximum)",
    )


class InterventionOption(ConfidenceMixin):
    """A single candidate intervention with computed impact metrics."""
    intervention_id: str
    label: str = Field(..., description="Human-readable action label")
    description: str = Field(default="", description="Extended explanation")
    targets: List[InterventionTarget] = Field(default_factory=list)
    timing_phase: int = Field(
        default=0, ge=0,
        description="Phase index at which intervention is applied",
    )
    timing_window: str = Field(
        default="T0-T1",
        description="Recommended timing window",
    )
    estimated_cost: float = Field(
        default=0.30, ge=0.0, le=1.0,
        description="Normalized cost (0 = free, 1 = maximum cost)",
    )
    # Computed impact metrics
    baseline_peak_energy: float = Field(
        default=0.0, ge=0.0,
        description="E_baseline_max — peak energy without this intervention",
    )
    intervened_peak_energy: float = Field(
        default=0.0, ge=0.0,
        description="E_intervened_max — peak energy with this intervention applied",
    )
    peak_reduction: float = Field(
        default=0.0, ge=0.0,
        description="ΔE = E_baseline_max - E_intervened_max",
    )
    efficiency_score: float = Field(
        default=0.0, ge=0.0,
        description="Eff = ΔE / (Cost + ε)",
    )
    delay_loss: Optional[float] = Field(
        default=None, ge=0.0,
        description="DelayLoss — additional peak energy if intervention is delayed one phase",
    )


class InterventionSet(DeevoBaseModel):
    """Ranked set of intervention options for a scenario."""
    scenario_id: str
    baseline_peak_energy: float = Field(
        default=0.0, ge=0.0,
        description="E_baseline_max — peak energy with no intervention",
    )
    interventions: List[InterventionOption] = Field(default_factory=list)
    best_intervention_id: Optional[str] = Field(
        default=None,
        description="ID of highest-efficiency intervention",
    )
    combined_reduction_potential: float = Field(
        default=0.0, ge=0.0,
        description="Estimated peak reduction if top interventions are applied together",
    )
