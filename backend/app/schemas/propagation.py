"""Propagation state schemas for Phase 2D hardened simulation.

Computational objects:
- NodeTrajectory: z_i(0:T) — full activation series for a single node
- PropagationEnergySeries: E(t) = Σ ω_i z_i(t) — aggregate energy per phase
- PropagationState: complete propagation output with trajectories, energy, peak, stability
"""
from __future__ import annotations

from typing import Dict, List, Optional

from pydantic import Field

from app.schemas.common import DeevoBaseModel


class NodeTrajectory(DeevoBaseModel):
    """z_i(0:T) — activation trajectory for a single graph node."""
    node_id: str
    activations: List[float] = Field(
        ..., description="Activation values per phase [z_i(0), z_i(1), ..., z_i(T)]"
    )
    peak_activation: float = Field(default=0.0, ge=0.0, le=1.0)
    peak_phase: int = Field(default=0, ge=0, description="Phase index of peak activation")
    is_escalation_zone: bool = Field(
        default=False,
        description="True if node showed monotonic increase over >=3 consecutive phases",
    )


class PropagationEnergySeries(DeevoBaseModel):
    """E(t) = Σ ω_i z_i(t) — aggregate propagation energy across all nodes."""
    energy_values: List[float] = Field(
        ..., description="Aggregate energy per phase [E(0), E(1), ..., E(T)]"
    )
    peak_energy: float = Field(default=0.0, ge=0.0, description="E_max = max_t E(t)")
    peak_phase: int = Field(default=0, ge=0, description="t* = argmax_t E(t)")
    stability_score: float = Field(
        default=0.0, ge=0.0, le=1.0,
        description="S_stab = 1 - (1/(T-1)) Σ|E(t+1)-E(t)|. Low = volatile.",
    )
    final_energy: float = Field(default=0.0, ge=0.0, description="E(T) — terminal energy")


class PropagationState(DeevoBaseModel):
    """Complete propagation output for a single simulation run.

    Contains node-level trajectories, aggregate energy series, and system-level
    metrics (peak impact, stability, escalation zones).
    """
    node_trajectories: List[NodeTrajectory] = Field(default_factory=list)
    energy_series: PropagationEnergySeries
    escalation_zone_count: int = Field(
        default=0, ge=0,
        description="Number of nodes exhibiting sustained escalation",
    )
    avg_peak_activation: float = Field(
        default=0.0, ge=0.0, le=1.0,
        description="Mean of per-node peak activations",
    )
    damping_applied: float = Field(
        default=0.15, ge=0.0, le=1.0,
        description="μ_i damping coefficient used in this run",
    )
    noise_scale_applied: float = Field(
        default=0.0, ge=0.0,
        description="η perturbation scale used (0 = deterministic)",
    )
