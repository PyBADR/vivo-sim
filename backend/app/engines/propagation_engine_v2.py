"""Hardened propagation engine — Phase 2D.

z_i(t+1) = (1 - μ_i) z_i(t) + μ_i φ(Σ_j w_ji z_j(t) + b_i + u_i(t) + η_i(t))

Where:
  μ_i  = damping / adaptation coefficient
  φ    = logistic response function
  b_i  = baseline susceptibility
  u_i  = intervention input
  η_i  = stochastic perturbation (optional)

System-level metrics:
  E(t) = Σ ω_i z_i(t)           — propagation energy
  E_max = max_t E(t)             — peak impact
  t*   = argmax_t E(t)           — time to peak
  S_stab = 1 - mean(|ΔE|)       — stability score
"""
from __future__ import annotations

import math
import random
from dataclasses import dataclass, field
from typing import Any, Optional

from app.config.math_constants import MathConstants


@dataclass(slots=True)
class HardenedPropagationConfig:
    """Configuration for one propagation run."""
    damping: float = 0.15
    baseline_susceptibility: float = 0.10
    noise_scale: float = 0.0          # 0 = deterministic
    logistic_steepness: float = 5.0
    logistic_midpoint: float = 0.50
    seed: Optional[int] = None


class HardenedPropagationEngine:
    """Phase 2D propagation engine with damping, logistic response, and perturbation."""

    def __init__(self, mc: MathConstants | None = None) -> None:
        self.mc = mc or MathConstants()

    @staticmethod
    def _clamp(value: float, low: float = 0.0, high: float = 1.0) -> float:
        return max(low, min(high, value))

    def _logistic(self, x: float, k: float, x0: float) -> float:
        """Bounded logistic response: φ(x) = 1 / (1 + exp(-k(x - x0)))."""
        exponent = -k * (x - x0)
        exponent = max(-20.0, min(20.0, exponent))  # prevent overflow
        return 1.0 / (1.0 + math.exp(exponent))

    def propagate_node(
        self,
        current: float,
        weighted_input_sum: float,
        baseline: float,
        intervention: float,
        noise: float,
        damping: float,
        k: float,
        x0: float,
    ) -> float:
        """Single node state update.

        z_i(t+1) = (1-μ) z_i(t) + μ φ(input_sum + b + u + η)
        """
        raw_input = weighted_input_sum + baseline + intervention + noise
        activated = self._logistic(raw_input, k, x0)
        next_val = (1.0 - damping) * current + damping * activated
        return self._clamp(next_val)

    def propagate_phase(
        self,
        node_states: dict[str, float],
        edges: list[dict[str, Any]],
        channel_boosts: dict[str, float],
        emotion_boosts: dict[str, float],
        time_decay: float,
        constraint_multiplier: float,
        stabilization_effects: dict[str, float] | None = None,
        intervention_effects: dict[str, float] | None = None,
        config: HardenedPropagationConfig | None = None,
    ) -> dict[str, float]:
        """Run one hardened propagation step.

        Backward-compatible with the original PropagationEngine.propagate_phase signature,
        with additional optional parameters for Phase 2D features.
        """
        config = config or HardenedPropagationConfig(
            damping=self.mc.propagation.damping_default,
            baseline_susceptibility=self.mc.propagation.baseline_susceptibility,
            noise_scale=self.mc.propagation.noise_scale,
            logistic_steepness=self.mc.propagation.logistic_steepness,
            logistic_midpoint=self.mc.propagation.logistic_midpoint,
        )
        stabilization_effects = stabilization_effects or {}
        intervention_effects = intervention_effects or {}

        rng = random.Random(config.seed) if config.seed is not None else random.Random()

        # Build weighted input sums per node from edges
        input_sums: dict[str, float] = {nid: 0.0 for nid in node_states}

        for edge in edges:
            source = edge["source"]
            target = edge["target"]
            weight = float(edge.get("weight", 0.0))
            channel = edge.get("channel", "default")
            emotion = edge.get("emotion", "default")

            source_val = float(node_states.get(source, 0.0))
            ch_boost = float(channel_boosts.get(channel, 1.0))
            em_boost = float(emotion_boosts.get(emotion, 1.0))

            # w_ji * z_j(t) with channel/emotion/time modulation
            contribution = source_val * weight * ch_boost * em_boost * time_decay * constraint_multiplier
            input_sums.setdefault(target, 0.0)
            input_sums[target] += contribution

        # Update each node
        next_states: dict[str, float] = {}
        for node_id, current in node_states.items():
            noise = rng.gauss(0.0, config.noise_scale) if config.noise_scale > 0 else 0.0
            intervention = float(intervention_effects.get(node_id, 0.0))
            stabilization = float(stabilization_effects.get(node_id, 0.0))

            # Intervention reduces or boosts effective input; stabilization acts as negative intervention
            effective_intervention = intervention - stabilization

            next_states[node_id] = self.propagate_node(
                current=current,
                weighted_input_sum=input_sums.get(node_id, 0.0),
                baseline=config.baseline_susceptibility,
                intervention=effective_intervention,
                noise=noise,
                damping=config.damping,
                k=config.logistic_steepness,
                x0=config.logistic_midpoint,
            )

        return next_states

    def compute_energy(
        self,
        node_states: dict[str, float],
        node_weights: dict[str, float] | None = None,
    ) -> float:
        """E(t) = Σ ω_i z_i(t)."""
        if node_weights is None:
            return sum(node_states.values())
        return sum(
            float(node_weights.get(nid, self.mc.propagation.energy_node_weight_default)) * val
            for nid, val in node_states.items()
        )

    def compute_stability_score(self, energy_series: list[float]) -> float:
        """S_stab = 1 - (1/(T-1)) Σ|E(t+1) - E(t)|.

        Returns value in [0, 1]. Low = volatile propagation.
        """
        if len(energy_series) < 2:
            return 1.0
        T = len(energy_series)
        total_delta = sum(abs(energy_series[t + 1] - energy_series[t]) for t in range(T - 1))
        avg_delta = total_delta / (T - 1)
        return self._clamp(1.0 - avg_delta)

    def detect_escalation_zones(
        self,
        trajectories: dict[str, list[float]],
        min_consecutive: int = 3,
    ) -> list[str]:
        """Identify nodes with monotonic increase over min_consecutive phases."""
        escalation_nodes = []
        for node_id, series in trajectories.items():
            if len(series) < min_consecutive:
                continue
            max_run = 0
            current_run = 0
            for t in range(1, len(series)):
                if series[t] > series[t - 1] + 1e-6:
                    current_run += 1
                    max_run = max(max_run, current_run)
                else:
                    current_run = 0
            if max_run >= min_consecutive - 1:
                escalation_nodes.append(node_id)
        return escalation_nodes
