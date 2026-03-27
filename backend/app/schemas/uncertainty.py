"""Uncertainty envelope schemas for Phase 2D.

U = {U_S, U_Σ, U_G, U_G*, U_Z, U_D}

Each U_stage ∈ [0,1] where 0 = fully certain, 1 = fully uncertain.
"""
from __future__ import annotations

from typing import Dict, List, Optional

from pydantic import Field

from app.schemas.common import DeevoBaseModel


class StageUncertainty(DeevoBaseModel):
    """Uncertainty measurement for a single pipeline stage."""
    stage: str = Field(..., description="Pipeline stage identifier (e.g. 'normalization', 'signal', 'graph')")
    score: float = Field(..., ge=0.0, le=1.0, description="0 = certain, 1 = fully uncertain")
    drivers: List[str] = Field(
        default_factory=list,
        description="Human-readable uncertainty drivers for this stage",
    )
    sample_size: Optional[int] = Field(
        default=None, ge=0,
        description="Number of items contributing to this uncertainty (signals, edges, etc.)",
    )


class UncertaintyEnvelope(DeevoBaseModel):
    """Complete uncertainty state across the pipeline.

    Composed of per-stage scores plus aggregate branch and simulation uncertainty.
    """
    stage_scores: List[StageUncertainty] = Field(default_factory=list)
    branch_entropy: float = Field(
        default=0.0, ge=0.0,
        description="U_B = -Σ p(b_i) log p(b_i). 0 = one dominant branch.",
    )
    simulation_variance: float = Field(
        default=0.0, ge=0.0,
        description="Var(Y) across K perturbed runs. Higher = less stable.",
    )
    decision_uncertainty: float = Field(
        default=0.0, ge=0.0, le=1.0,
        description="U_D = 1 - σ((D(a*) - D(a²)) / (σ̂_D + ε)). High = narrow action margin.",
    )
    composite_uncertainty: float = Field(
        default=0.0, ge=0.0, le=1.0,
        description="Weighted average of stage uncertainties.",
    )
    key_drivers: List[str] = Field(
        default_factory=list,
        description="Top uncertainty drivers across all stages (human-readable).",
    )
    notes: List[str] = Field(
        default_factory=list,
        description="Interpretive notes (e.g. 'high uncertainty driven by weak signal coverage').",
    )
