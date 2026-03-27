from __future__ import annotations

from dataclasses import dataclass
from typing import Any


@dataclass(slots=True)
class PropagationInput:
    source_activation: float
    edge_weight: float
    channel_boost: float
    emotion_boost: float
    time_decay: float
    constraint_multiplier: float


@dataclass(slots=True)
class NodeUpdateInput:
    current_value: float
    incoming_deltas: list[float]
    stabilization_effect: float


class PropagationEngine:
    """
    Core weighted graph propagation engine.

    Formula:
    delta_x =
        source_activation
        * edge_weight
        * channel_boost
        * emotion_boost
        * time_decay
        * constraint_multiplier
    """

    @staticmethod
    def _clamp(value: float, low: float = 0.0, high: float = 1.0) -> float:
        return max(low, min(high, value))

    def compute_delta(self, payload: PropagationInput) -> float:
        if payload.edge_weight < 0:
            raise ValueError("edge_weight must be >= 0")
        if payload.time_decay < 0:
            raise ValueError("time_decay must be >= 0")
        if payload.constraint_multiplier < 0:
            raise ValueError("constraint_multiplier must be >= 0")

        delta = (
            payload.source_activation
            * payload.edge_weight
            * payload.channel_boost
            * payload.emotion_boost
            * payload.time_decay
            * payload.constraint_multiplier
        )
        return self._clamp(delta)

    def update_node(self, payload: NodeUpdateInput) -> float:
        total_incoming = sum(payload.incoming_deltas)
        next_value = payload.current_value + total_incoming - payload.stabilization_effect
        return self._clamp(next_value)

    def propagate_phase(
        self,
        node_states: dict[str, float],
        edges: list[dict[str, Any]],
        channel_boosts: dict[str, float],
        emotion_boosts: dict[str, float],
        time_decay: float,
        constraint_multiplier: float,
        stabilization_effects: dict[str, float] | None = None,
    ) -> dict[str, float]:
        """
        Run one propagation step over the graph.

        Expected edge shape:
        {
            "source": "DXB",
            "target": "EK",
            "weight": 0.88,
            "channel": "aviation",
            "emotion": "concern"
        }
        """
        stabilization_effects = stabilization_effects or {}
        incoming_map: dict[str, list[float]] = {node_id: [] for node_id in node_states}

        for edge in edges:
            source = edge["source"]
            target = edge["target"]
            weight = float(edge.get("weight", 0.0))
            channel = edge.get("channel", "default")
            emotion = edge.get("emotion", "default")

            source_activation = float(node_states.get(source, 0.0))
            channel_boost = float(channel_boosts.get(channel, 1.0))
            emotion_boost = float(emotion_boosts.get(emotion, 1.0))

            delta = self.compute_delta(
                PropagationInput(
                    source_activation=source_activation,
                    edge_weight=weight,
                    channel_boost=channel_boost,
                    emotion_boost=emotion_boost,
                    time_decay=time_decay,
                    constraint_multiplier=constraint_multiplier,
                )
            )
            incoming_map.setdefault(target, []).append(delta)

        next_states: dict[str, float] = {}
        for node_id, current_value in node_states.items():
            next_states[node_id] = self.update_node(
                NodeUpdateInput(
                    current_value=float(current_value),
                    incoming_deltas=incoming_map.get(node_id, []),
                    stabilization_effect=float(stabilization_effects.get(node_id, 0.0)),
                )
            )

        return next_states
