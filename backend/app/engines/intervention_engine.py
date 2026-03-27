"""Intervention engine — Phase 2D.

Interventions are first-class actions that alter propagation dynamics.

u_i(t) = Γ(i_k, v_i, t)           — intervention effect on node i at time t
ΔE(i_k) = E_baseline_max - E_intervened_max  — peak reduction
Eff(i_k) = ΔE(i_k) / (Cost(i_k) + ε)        — efficiency
DelayLoss(i_k, τ) = E_max(at τ) - E_max(at 0) — timing sensitivity
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from app.config.math_constants import MathConstants


@dataclass(slots=True)
class InterventionDef:
    """Definition of an available intervention."""
    intervention_id: str
    label: str
    description: str
    target_node_ids: list[str]
    target_edge_types: list[str]
    effect_type: str          # 'dampen_node' | 'boost_node' | 'reduce_edge' | 'amplify_edge'
    magnitude: float          # [0, 1] — strength of effect
    timing_phase: int         # phase index at which to apply
    estimated_cost: float     # [0, 1] — normalized cost


# Pre-defined GCC-relevant interventions
DEFAULT_INTERVENTIONS: list[InterventionDef] = [
    InterventionDef(
        intervention_id="intv-public-statement",
        label="Issue public statement",
        description="Official communication to reduce public uncertainty and media amplification",
        target_node_ids=[],
        target_edge_types=["amplifies", "influences"],
        effect_type="reduce_edge",
        magnitude=0.30,
        timing_phase=0,
        estimated_cost=0.10,
    ),
    InterventionDef(
        intervention_id="intv-regulator-clarification",
        label="Regulator clarification",
        description="Regulatory body issues formal guidance to stabilize policy uncertainty",
        target_node_ids=[],
        target_edge_types=["regulates", "constrained_by"],
        effect_type="dampen_node",
        magnitude=0.35,
        timing_phase=1,
        estimated_cost=0.15,
    ),
    InterventionDef(
        intervention_id="intv-pricing-adjustment",
        label="Pricing adjustment",
        description="Temporary pricing or rate adjustment to absorb market stress",
        target_node_ids=[],
        target_edge_types=["exposed_to", "depends_on"],
        effect_type="dampen_node",
        magnitude=0.25,
        timing_phase=1,
        estimated_cost=0.40,
    ),
    InterventionDef(
        intervention_id="intv-operational-throttle",
        label="Operational throttling",
        description="Reduce operational exposure by throttling capacity or routes",
        target_node_ids=[],
        target_edge_types=["routes_through", "operates_in"],
        effect_type="reduce_edge",
        magnitude=0.40,
        timing_phase=0,
        estimated_cost=0.35,
    ),
    InterventionDef(
        intervention_id="intv-media-containment",
        label="Media containment",
        description="Proactive media management to dampen amplification channels",
        target_node_ids=[],
        target_edge_types=["amplifies", "influences"],
        effect_type="reduce_edge",
        magnitude=0.28,
        timing_phase=0,
        estimated_cost=0.20,
    ),
    InterventionDef(
        intervention_id="intv-internal-escalation",
        label="Internal escalation",
        description="Cross-functional escalation to accelerate containment response",
        target_node_ids=[],
        target_edge_types=[],
        effect_type="dampen_node",
        magnitude=0.20,
        timing_phase=0,
        estimated_cost=0.08,
    ),
]


class InterventionEngine:
    """Computes intervention effects on propagation and ranks by efficiency."""

    def __init__(self, mc: MathConstants | None = None) -> None:
        self.mc = mc or MathConstants()

    @staticmethod
    def _clamp(value: float, low: float = 0.0, high: float = 1.0) -> float:
        return max(low, min(high, value))

    def get_available_interventions(self) -> list[InterventionDef]:
        """Return the set of available interventions."""
        return list(DEFAULT_INTERVENTIONS)

    def compute_node_effects(
        self,
        intervention: InterventionDef,
        node_ids: list[str],
        edge_types_by_node: dict[str, list[str]],
    ) -> dict[str, float]:
        """Compute u_i(t) — per-node intervention effect.

        For 'dampen_node': negative effect (reduces activation)
        For 'boost_node': positive effect (increases activation)
        For edge-based: affects nodes connected by matching edge types
        """
        effects: dict[str, float] = {}

        if intervention.effect_type in ("dampen_node", "boost_node"):
            # Target specific nodes, or all nodes if targets empty
            targets = intervention.target_node_ids or node_ids
            sign = -1.0 if intervention.effect_type == "dampen_node" else 1.0
            for nid in targets:
                effects[nid] = sign * intervention.magnitude

        elif intervention.effect_type in ("reduce_edge", "amplify_edge"):
            # Affect nodes connected by matching edge types
            sign = -1.0 if intervention.effect_type == "reduce_edge" else 1.0
            for nid in node_ids:
                node_edges = edge_types_by_node.get(nid, [])
                # Check if any of this node's edges match intervention targets
                matching = sum(1 for et in node_edges if et in intervention.target_edge_types)
                if matching > 0:
                    # Scale by proportion of matching edges
                    total_edges = max(1, len(node_edges))
                    scale = min(1.0, matching / total_edges)
                    effects[nid] = sign * intervention.magnitude * scale

        return effects

    def compute_edge_weight_modifiers(
        self,
        intervention: InterventionDef,
        edges: list[dict[str, Any]],
    ) -> list[dict[str, Any]]:
        """Modify edge weights based on intervention.

        Returns modified edge list.
        """
        if intervention.effect_type not in ("reduce_edge", "amplify_edge"):
            return list(edges)

        multiplier = (1.0 - intervention.magnitude) if intervention.effect_type == "reduce_edge" else (1.0 + intervention.magnitude)
        modified = []
        for edge in edges:
            new_edge = dict(edge)
            edge_type = str(edge.get("type", "")).lower()
            if not intervention.target_edge_types or edge_type in [t.lower() for t in intervention.target_edge_types]:
                new_edge["weight"] = self._clamp(float(edge.get("weight", 0.3)) * multiplier)
            modified.append(new_edge)
        return modified

    def compute_timing_decay(
        self,
        intervention: InterventionDef,
        applied_phase: int,
    ) -> float:
        """Compute effectiveness decay based on timing.

        Later application reduces intervention effectiveness.
        """
        delay = max(0, applied_phase - intervention.timing_phase)
        decay_per_phase = self.mc.intervention.timing_decay_per_phase
        return max(0.0, 1.0 - delay * decay_per_phase)

    def compute_efficiency(
        self,
        peak_reduction: float,
        cost: float,
    ) -> float:
        """Eff(i_k) = ΔE / (Cost + ε)."""
        eps = self.mc.intervention.efficiency_epsilon
        return peak_reduction / (cost + eps)

    def rank_interventions(
        self,
        scored: list[dict[str, Any]],
    ) -> list[dict[str, Any]]:
        """Rank interventions by efficiency score, descending."""
        return sorted(scored, key=lambda x: float(x.get("efficiency_score", 0.0)), reverse=True)
