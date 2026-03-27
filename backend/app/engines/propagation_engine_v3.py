"""Layer-aware propagation engine — Phase 3 (Crisis Pack).

P_i(t+1) = σ(Σ_j w_ji · P_j(t) + s_i + u_i(t))

Where:
  w_ji  = influence weight from node j to i (edge weight)
  s_i   = baseline sensitivity (f(vulnerability, exposure, criticality))
  u_i   = external shock input
  σ     = bounded sigmoid activation
"""
import math
from typing import Dict, List

from app.schemas.crisis_common import CrisisNode, CrisisEdge
from app.schemas.crisis_outputs import PropagationStep


def sigmoid(x: float) -> float:
    """Bounded sigmoid: σ(x) = 1 / (1 + exp(-x))."""
    clamped = max(-20.0, min(20.0, x))
    return 1.0 / (1.0 + math.exp(-clamped))


def build_adjacency(edges: List[CrisisEdge]) -> Dict[str, List[tuple]]:
    """Build target → [(source, weight)] adjacency map."""
    adjacency: Dict[str, List[tuple]] = {}
    for edge in edges:
        adjacency.setdefault(edge.target, []).append(
            (edge.source, edge.weight)
        )
    return adjacency


def run_propagation(
    nodes: List[CrisisNode],
    edges: List[CrisisEdge],
    initial_shocks: Dict[str, float],
    steps: int = 5,
) -> List[PropagationStep]:
    """Run layer-aware propagation across crisis graph.

    Each step computes:
      P_i(t+1) = σ(Σ_j w_ji P_j(t) + baseline_i + shock_i - 0.5)

    Where baseline_i = 0.25·V_i + 0.25·E_i + 0.50·C_i
    """
    node_ids = [n.id for n in nodes]
    adjacency = build_adjacency(edges)

    state = {nid: initial_shocks.get(nid, 0.0) for nid in node_ids}
    outputs: List[PropagationStep] = []

    for step_idx in range(steps):
        next_state = {}
        total_energy = 0.0

        for node in nodes:
            incoming = adjacency.get(node.id, [])
            propagated = sum(
                state.get(src, 0.0) * weight
                for src, weight in incoming
            )
            baseline = (
                0.25 * node.vulnerability
                + 0.25 * node.exposure
                + 0.50 * node.criticality
            )
            score = sigmoid(propagated + baseline - 0.5)
            next_state[node.id] = round(score, 4)
            total_energy += score

        outputs.append(
            PropagationStep(
                step=step_idx,
                node_scores=next_state,
                total_energy=round(total_energy, 4),
            )
        )
        state = next_state

    return outputs
