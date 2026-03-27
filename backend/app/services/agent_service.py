"""Agent profile generation service.

Pipeline position: Step 4
Input:  Enriched graph nodes + edges
Output: AgentProfile list with behavioral parameters
"""
from __future__ import annotations

import logging
from typing import List

from app.schemas.agent import AgentProfile, AgentProfileRequest, AgentProfileResponse
from app.schemas.common import EmotionalState, EntityType, Stance

logger = logging.getLogger(__name__)


# ── GCC agent archetypes ─────────────────────────────────────────────
ARCHETYPE_DEFAULTS: dict[str, dict] = {
    "regulator": {
        "reaction_delay_hours": 2,
        "amplification_factor": 1.5,
        "preferred_channel": "official_statement",
        "emotional_state": EmotionalState.STABLE,
    },
    "airport_ops": {
        "reaction_delay_hours": 1,
        "amplification_factor": 0.8,
        "preferred_channel": "direct",
        "emotional_state": EmotionalState.CONCERNED,
    },
    "airline": {
        "reaction_delay_hours": 3,
        "amplification_factor": 1.0,
        "preferred_channel": "direct",
        "emotional_state": EmotionalState.CONCERNED,
    },
    "media": {
        "reaction_delay_hours": 0,
        "amplification_factor": 1.8,
        "preferred_channel": "broadcast",
        "emotional_state": EmotionalState.STABLE,
    },
    "public": {
        "reaction_delay_hours": 1,
        "amplification_factor": 0.5,
        "preferred_channel": "social",
        "emotional_state": EmotionalState.FEARFUL,
    },
    "bank": {
        "reaction_delay_hours": 4,
        "amplification_factor": 0.6,
        "preferred_channel": "direct",
        "emotional_state": EmotionalState.STABLE,
    },
    "sector": {
        "reaction_delay_hours": 6,
        "amplification_factor": 0.4,
        "preferred_channel": "report",
        "emotional_state": EmotionalState.STABLE,
    },
}


class AgentService:
    """Generates behavioral agent profiles from enriched graph nodes.

    Each agent inherits scores from graph enrichment and receives
    GCC-specific behavioral parameters based on entity type.
    """

    async def generate_profiles(self, request: AgentProfileRequest) -> AgentProfileResponse:
        """Generate agent profiles from enriched nodes."""
        profiles: List[AgentProfile] = []

        for node_data in request.enriched_nodes:
            node_type = node_data.get("type", "sector")
            archetype = self._resolve_archetype(node_type)
            defaults = ARCHETYPE_DEFAULTS.get(archetype, ARCHETYPE_DEFAULTS["sector"])

            profile = AgentProfile(
                id=node_data.get("id", "unknown"),
                role=archetype,
                influence_score=node_data.get("influence_score", 0.5),
                trust_score=node_data.get("trust_score", 0.5),
                propagation_score=node_data.get("propagation_score", 0.3),
                stance=node_data.get("stance", Stance.NEUTRAL),
                reaction_delay_hours=defaults["reaction_delay_hours"],
                amplification_factor=defaults["amplification_factor"],
                preferred_channel=defaults["preferred_channel"],
                emotional_state=defaults["emotional_state"],
                memory_state={},
            )
            profiles.append(profile)

        confidence = 0.7 if profiles else 0.3
        return AgentProfileResponse(
            scenario_id=request.scenario_id,
            agent_profiles=profiles,
            confidence=confidence,
        )

    def _resolve_archetype(self, entity_type: str) -> str:
        mapping = {
            EntityType.REGULATOR.value: "regulator",
            EntityType.MINISTRY.value: "regulator",
            EntityType.AIRPORT.value: "airport_ops",
            EntityType.AIRLINE.value: "airline",
            EntityType.MEDIA.value: "media",
            EntityType.PLATFORM.value: "media",
            EntityType.PUBLIC_CLUSTER.value: "public",
            EntityType.BANK.value: "bank",
            EntityType.SECTOR.value: "sector",
            EntityType.COMMODITY.value: "sector",
            EntityType.PORT.value: "sector",
            EntityType.ROUTE.value: "sector",
            EntityType.COUNTRY.value: "regulator",
        }
        return mapping.get(entity_type, "sector")
