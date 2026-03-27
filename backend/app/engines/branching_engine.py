"""Scenario branching engine — Phase 2D.

Generates B = {b_1, ..., b_k} plausible scenario branches by modifying
propagation parameters (damping, edge weights, noise) for each branch type.

Branch types:
  baseline      — current propagation parameters unchanged
  amplification — reduced damping + boosted edge weights (media/social amplify)
  containment   — increased damping + reduced edge weights (timely response)
  adverse       — increased noise + boosted susceptibility (worst-case path)

E[Y] = Σ p(b_i) Y(b_i)
U_B  = -Σ p(b_i) log p(b_i)   (branch entropy)
"""
from __future__ import annotations

import math
from dataclasses import dataclass
from typing import Any

from app.config.math_constants import MathConstants
from app.engines.propagation_engine_v2 import HardenedPropagationConfig


@dataclass(slots=True)
class BranchConfig:
    """Configuration for a single branch — modifies propagation parameters."""
    branch_id: str
    branch_label: str
    branch_probability: float
    branch_trigger: str
    damping_multiplier: float = 1.0
    edge_weight_multiplier: float = 1.0
    noise_scale_multiplier: float = 1.0
    susceptibility_multiplier: float = 1.0


class BranchingEngine:
    """Generates scenario branch configurations from signal/graph context."""

    def __init__(self, mc: MathConstants | None = None) -> None:
        self.mc = mc or MathConstants()

    def generate_branch_configs(
        self,
        scenario_context: dict[str, Any],
    ) -> list[BranchConfig]:
        """Generate the standard 4-branch set with probabilities adjusted by context.

        scenario_context may include:
          - trigger_severity: float
          - media_signal_count: int
          - constraint_count: int
          - has_policy_response: bool
        """
        bc = self.mc.branching
        trigger_severity = float(scenario_context.get("trigger_severity", 0.5))
        media_count = int(scenario_context.get("media_signal_count", 0))
        constraint_count = int(scenario_context.get("constraint_count", 0))
        has_policy = bool(scenario_context.get("has_policy_response", False))

        # Adjust probabilities based on context
        weights = list(bc.default_branch_weights[:4])

        # If high severity, amplification and adverse become more likely
        if trigger_severity > 0.65:
            weights[1] += 0.08  # amplification
            weights[3] += 0.05  # adverse
            weights[0] -= 0.08  # baseline
            weights[2] -= 0.05  # containment

        # If media signals present, amplification branch weight increases
        if media_count > 2:
            weights[1] += 0.05
            weights[0] -= 0.05

        # If policy response exists, containment becomes more likely
        if has_policy:
            weights[2] += 0.06
            weights[1] -= 0.03
            weights[3] -= 0.03

        # Normalize to sum to 1.0
        total = sum(weights)
        weights = [w / total for w in weights]

        configs = [
            BranchConfig(
                branch_id="branch-baseline",
                branch_label="baseline",
                branch_probability=weights[0],
                branch_trigger="Current conditions persist without escalation or intervention",
                damping_multiplier=1.0,
                edge_weight_multiplier=1.0,
                noise_scale_multiplier=1.0,
                susceptibility_multiplier=1.0,
            ),
            BranchConfig(
                branch_id="branch-amplification",
                branch_label="amplification",
                branch_probability=weights[1],
                branch_trigger="Media amplification intensifies; social channels accelerate spread",
                damping_multiplier=bc.amplification_damping_reduction,
                edge_weight_multiplier=bc.amplification_edge_boost,
                noise_scale_multiplier=1.2,
                susceptibility_multiplier=1.15,
            ),
            BranchConfig(
                branch_id="branch-containment",
                branch_label="containment",
                branch_probability=weights[2],
                branch_trigger="Official response and policy intervention dampen propagation",
                damping_multiplier=bc.containment_damping_boost,
                edge_weight_multiplier=bc.containment_edge_reduction,
                noise_scale_multiplier=0.6,
                susceptibility_multiplier=0.80,
            ),
            BranchConfig(
                branch_id="branch-adverse",
                branch_label="adverse",
                branch_probability=weights[3],
                branch_trigger="Escalation cascade with secondary triggers and weak containment",
                damping_multiplier=0.70,
                edge_weight_multiplier=1.20,
                noise_scale_multiplier=bc.adverse_noise_boost,
                susceptibility_multiplier=bc.adverse_susceptibility_boost,
            ),
        ]

        return configs

    def make_propagation_config(
        self,
        branch: BranchConfig,
        base_config: HardenedPropagationConfig,
        seed_offset: int = 0,
    ) -> HardenedPropagationConfig:
        """Create a modified propagation config for this branch."""
        return HardenedPropagationConfig(
            damping=min(1.0, base_config.damping * branch.damping_multiplier),
            baseline_susceptibility=min(1.0, base_config.baseline_susceptibility * branch.susceptibility_multiplier),
            noise_scale=max(0.0, base_config.noise_scale * branch.noise_scale_multiplier),
            logistic_steepness=base_config.logistic_steepness,
            logistic_midpoint=base_config.logistic_midpoint,
            seed=(base_config.seed or 42) + seed_offset,
        )

    def modify_edges(
        self,
        edges: list[dict[str, Any]],
        multiplier: float,
    ) -> list[dict[str, Any]]:
        """Scale edge weights for a branch."""
        modified = []
        for edge in edges:
            new_edge = dict(edge)
            new_edge["weight"] = min(1.0, float(edge.get("weight", 0.3)) * multiplier)
            modified.append(new_edge)
        return modified

    @staticmethod
    def compute_branch_entropy(probabilities: list[float]) -> float:
        """U_B = -Σ p(b_i) log p(b_i).

        Returns 0 when one branch dominates; max when uniform.
        """
        entropy = 0.0
        for p in probabilities:
            if p > 1e-10:
                entropy -= p * math.log(p)
        return entropy

    @staticmethod
    def compute_expected_outcome(
        probabilities: list[float],
        outcomes: list[float],
    ) -> float:
        """E[Y] = Σ p(b_i) Y(b_i)."""
        return sum(p * y for p, y in zip(probabilities, outcomes))
