"""Uncertainty engine — Phase 2D.

Computes explicit, compositional uncertainty across the pipeline:

U_S  = normalization uncertainty (from field confidence)
U_Σ  = 1 - mean(c_i)             — signal uncertainty
U_G  = mean(1 - c_ij)            — graph uncertainty
U_B  = -Σ p(b_i) log p(b_i)     — branch entropy
U_Z  = Var(Y) over K perturbed runs — simulation variance
U_D  = 1 - σ((D(a*) - D(a²))/(σ̂_D + ε)) — decision margin uncertainty
"""
from __future__ import annotations

import math
import statistics
from typing import Any, Optional

from app.config.math_constants import MathConstants
from app.schemas.uncertainty import StageUncertainty, UncertaintyEnvelope


class UncertaintyEngine:
    """Computes stage-level and composite uncertainty."""

    def __init__(self, mc: MathConstants | None = None) -> None:
        self.mc = mc or MathConstants()

    @staticmethod
    def _clamp(value: float, low: float = 0.0, high: float = 1.0) -> float:
        return max(low, min(high, value))

    def normalization_uncertainty(
        self,
        field_confidences: list[float],
    ) -> StageUncertainty:
        """U_S = 1 - mean(field confidences).

        If no field confidences are available, returns high uncertainty.
        """
        if not field_confidences:
            return StageUncertainty(
                stage="normalization",
                score=0.80,
                drivers=["no field confidence data available"],
                sample_size=0,
            )
        mean_conf = sum(field_confidences) / len(field_confidences)
        score = self._clamp(1.0 - mean_conf)
        drivers = []
        low_fields = sum(1 for c in field_confidences if c < 0.5)
        if low_fields > 0:
            drivers.append(f"{low_fields} fields with confidence < 0.5")
        if len(field_confidences) < 5:
            drivers.append("sparse field coverage")
        return StageUncertainty(
            stage="normalization",
            score=round(score, 4),
            drivers=drivers,
            sample_size=len(field_confidences),
        )

    def signal_uncertainty(
        self,
        signal_confidences: list[float],
    ) -> StageUncertainty:
        """U_Σ = 1 - (1/m) Σ c_i."""
        if not signal_confidences:
            return StageUncertainty(
                stage="signal",
                score=0.85,
                drivers=["no signals extracted"],
                sample_size=0,
            )
        mean_conf = sum(signal_confidences) / len(signal_confidences)
        score = self._clamp(1.0 - mean_conf)
        drivers = []
        low_signals = sum(1 for c in signal_confidences if c < 0.4)
        if low_signals > 0:
            drivers.append(f"{low_signals} weak signals (confidence < 0.4)")
        if len(signal_confidences) < 3:
            drivers.append("low signal count")
        # Check variance
        if len(signal_confidences) > 1:
            variance = statistics.variance(signal_confidences)
            if variance > 0.05:
                drivers.append(f"high signal confidence variance ({variance:.3f})")
        return StageUncertainty(
            stage="signal",
            score=round(score, 4),
            drivers=drivers,
            sample_size=len(signal_confidences),
        )

    def graph_uncertainty(
        self,
        edge_confidences: list[float],
        inferred_edge_count: int = 0,
        total_edge_count: int = 0,
    ) -> StageUncertainty:
        """U_G = (1/|E|) Σ (1 - c_ij)."""
        if not edge_confidences:
            return StageUncertainty(
                stage="graph",
                score=0.70,
                drivers=["no edge confidence data"],
                sample_size=0,
            )
        mean_gap = sum(1.0 - c for c in edge_confidences) / len(edge_confidences)
        score = self._clamp(mean_gap)
        drivers = []
        if inferred_edge_count > 0 and total_edge_count > 0:
            ratio = inferred_edge_count / total_edge_count
            if ratio > 0.30:
                drivers.append(f"{inferred_edge_count}/{total_edge_count} edges are inferred ({ratio:.0%})")
        low_edges = sum(1 for c in edge_confidences if c < 0.5)
        if low_edges > 0:
            drivers.append(f"{low_edges} edges with confidence < 0.5")
        return StageUncertainty(
            stage="graph",
            score=round(score, 4),
            drivers=drivers,
            sample_size=len(edge_confidences),
        )

    def branch_entropy(self, probabilities: list[float]) -> float:
        """U_B = -Σ p(b_i) log p(b_i)."""
        entropy = 0.0
        for p in probabilities:
            if p > 1e-10:
                entropy -= p * math.log(p)
        return round(entropy, 4)

    def simulation_variance(self, peak_risks: list[float]) -> float:
        """Var(Y) across K perturbed simulation runs."""
        if len(peak_risks) < 2:
            return 0.0
        return round(statistics.variance(peak_risks), 6)

    def decision_uncertainty(
        self,
        top_score: float,
        second_score: float,
        score_std: float = 0.0,
    ) -> float:
        """U_D = 1 - σ((D(a*) - D(a²)) / (σ̂_D + ε)).

        Small margin between top two actions = high decision uncertainty.
        """
        eps = self.mc.uncertainty.decision_margin_epsilon
        k = self.mc.uncertainty.logistic_scale
        margin = top_score - second_score
        denominator = score_std + eps
        exponent = -k * (margin / denominator)
        exponent = max(-20.0, min(20.0, exponent))
        sigma = 1.0 / (1.0 + math.exp(exponent))
        return round(self._clamp(1.0 - sigma), 4)

    def build_envelope(
        self,
        stage_uncertainties: list[StageUncertainty],
        branch_entropy_val: float = 0.0,
        sim_variance: float = 0.0,
        decision_uncertainty_val: float = 0.0,
    ) -> UncertaintyEnvelope:
        """Build the complete uncertainty envelope."""
        # Composite = weighted average of stage scores
        if stage_uncertainties:
            composite = sum(s.score for s in stage_uncertainties) / len(stage_uncertainties)
        else:
            composite = 0.5

        # Collect all drivers
        all_drivers = []
        for su in stage_uncertainties:
            for d in su.drivers:
                all_drivers.append(f"[{su.stage}] {d}")

        # Build interpretive notes
        notes = []
        if composite > 0.60:
            notes.append("High overall uncertainty — outputs should be treated as directional, not precise.")
        if branch_entropy_val > 1.0:
            notes.append("High branch entropy — significant ambiguity across plausible futures.")
        if sim_variance > 0.01:
            notes.append("Elevated simulation variance — propagation is sensitive to perturbation.")
        if decision_uncertainty_val > 0.50:
            notes.append("Narrow action margin — top interventions have similar scores.")
        if not notes and composite < 0.30:
            notes.append("Relatively stable assessment with good coverage.")

        return UncertaintyEnvelope(
            stage_scores=stage_uncertainties,
            branch_entropy=branch_entropy_val,
            simulation_variance=sim_variance,
            decision_uncertainty=decision_uncertainty_val,
            composite_uncertainty=round(self._clamp(composite), 4),
            key_drivers=all_drivers[:8],
            notes=notes,
        )
