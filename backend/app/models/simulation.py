from typing import List, Optional
from pydantic import BaseModel


class AgentAction(BaseModel):
    """Agent action in simulation."""

    agent_id: str
    action: str
    sentiment_shift: float


class SimulationStep(BaseModel):
    """Single step in simulation."""

    step: int
    label: str
    summary: str
    events: List[str] = []
    sentiment_score: float
    visibility_score: float
    agent_actions: List[AgentAction] = []


class SimulationReport(BaseModel):
    """Simulation final report."""

    prediction: str
    main_driver: str
    top_influencers: List[str] = []
    spread_level: str
    confidence: float
    timeline_summary: List[str] = []
    graph_observations: List[str] = []


class Simulation(BaseModel):
    """Complete simulation model."""

    scenario_id: str
    steps: List[SimulationStep] = []
    report: SimulationReport
