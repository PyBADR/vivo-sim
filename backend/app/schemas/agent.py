from __future__ import annotations

from typing import List, Optional

from pydantic import Field

from app.schemas.common import ConfidenceMixin, DeevoBaseModel, EmotionalState, Stance


class AgentProfile(DeevoBaseModel):
    id: str
    role: str
    influence_score: float = Field(..., ge=0.0, le=1.0)
    trust_score: float = Field(..., ge=0.0, le=1.0)
    propagation_score: float = Field(..., ge=0.0, le=1.0)
    stance: Stance = Stance.NEUTRAL
    reaction_delay_hours: int = Field(default=0, ge=0, le=168)
    amplification_factor: float = Field(default=0.0, ge=0.0, le=2.0)
    preferred_channel: str = Field(default="direct")
    emotional_state: EmotionalState = EmotionalState.STABLE
    memory_state: dict = Field(default_factory=dict)


class AgentProfileRequest(DeevoBaseModel):
    scenario_id: str
    enriched_nodes: List[dict]
    edges: List[dict]


class AgentProfileResponse(ConfidenceMixin):
    scenario_id: str
    agent_profiles: List[AgentProfile] = Field(default_factory=list)
