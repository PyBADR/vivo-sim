import json
from pathlib import Path
from typing import List, Optional

from app.schemas.simulation import (
    SimulationRunInput,
    SimulationResponse,
    SimulationStep,
    SimulationReport,
    AgentAction,
)


def _get_seeds_dir() -> Path:
    """Get the seeds directory path."""
    backend_dir = Path(__file__).resolve().parent.parent.parent.parent
    return backend_dir.parent / "seeds"


def _load_seed_simulation(scenario_id: str) -> Optional[dict]:
    """Load seed simulation data for known scenarios."""
    try:
        seeds_dir = _get_seeds_dir()
        seed_file = seeds_dir / "simulation_seed.json"

        if seed_file.exists():
            with open(seed_file, 'r', encoding='utf-8') as f:
                return json.load(f)
    except Exception:
        pass
    return None


def _generate_mock_steps() -> List[SimulationStep]:
    """Generate 4 mock simulation steps with rule-based logic."""
    steps = []

    # Step 1: Initial reaction
    steps.append(SimulationStep(
        step=1,
        label="Initial Reaction",
        summary="Early awareness and initial response to the scenario",
        events=[
            "First mentions in social media",
            "Stakeholders begin to react",
            "Initial emotional responses"
        ],
        sentiment_score=0.3,
        visibility_score=0.2,
        agent_actions=[
            AgentAction(agent_id="agent_0", action="Post concern", sentiment_shift=-0.1),
            AgentAction(agent_id="agent_1", action="Issue statement", sentiment_shift=0.05),
        ]
    ))

    # Step 2: Amplification
    steps.append(SimulationStep(
        step=2,
        label="Amplification",
        summary="Influencers engage, visibility rises, polarization begins",
        events=[
            "Media coverage increases",
            "Influencers take positions",
            "Online debate intensifies",
            "Groups mobilize"
        ],
        sentiment_score=0.25,
        visibility_score=0.6,
        agent_actions=[
            AgentAction(agent_id="agent_2", action="Share opinion", sentiment_shift=-0.15),
            AgentAction(agent_id="agent_3", action="Publish analysis", sentiment_shift=0.0),
            AgentAction(agent_id="agent_5", action="Create content", sentiment_shift=-0.2),
        ]
    ))

    # Step 3: Peak
    steps.append(SimulationStep(
        step=3,
        label="Peak Intensity",
        summary="Maximum visibility and polarization, heated debates",
        events=[
            "Trending on social platforms",
            "Mainstream media saturation",
            "Extreme positions dominate",
            "Calls for action",
            "Counter-campaigns launch"
        ],
        sentiment_score=0.15,
        visibility_score=0.95,
        agent_actions=[
            AgentAction(agent_id="agent_0", action="Organize protest", sentiment_shift=-0.25),
            AgentAction(agent_id="agent_1", action="Call for dialogue", sentiment_shift=0.15),
            AgentAction(agent_id="agent_4", action="Research impact", sentiment_shift=0.05),
        ]
    ))

    # Step 4: Stabilization
    steps.append(SimulationStep(
        step=4,
        label="Stabilization",
        summary="Government response, sentiment normalizes, interest wanes",
        events=[
            "Official government response",
            "New policies announced",
            "Public sentiment moderates",
            "Media interest declines",
            "New issues emerge"
        ],
        sentiment_score=0.55,
        visibility_score=0.35,
        agent_actions=[
            AgentAction(agent_id="agent_1", action="Enforce regulation", sentiment_shift=0.2),
            AgentAction(agent_id="agent_2", action="Adapt strategy", sentiment_shift=0.1),
        ]
    ))

    return steps


async def run_simulation(input_data: SimulationRunInput) -> SimulationResponse:
    """Run simulation for a scenario."""
    try:
        scenario_id = input_data.scenario_id

        # Try loading seed simulation
        seed_sim = _load_seed_simulation(scenario_id)

        if seed_sim:
            steps = [SimulationStep(**s) for s in seed_sim.get('steps', [])]
            report_data = seed_sim.get('report', {})
        else:
            # Generate mock steps
            steps = _generate_mock_steps()

            # Create report from steps
            report_data = {
                "prediction": "Scenario evolves through typical lifecycle of awareness, amplification, peak, and stabilization",
                "main_driver": "Social media amplification and influencer engagement",
                "top_influencers": ["agent_3", "agent_5", "agent_0"],
                "spread_level": "high",
                "confidence": 0.75,
                "timeline_summary": [
                    "Initial reaction: Day 1-2",
                    "Amplification: Day 3-7",
                    "Peak: Day 8-15",
                    "Stabilization: Day 16+"
                ],
                "graph_observations": [
                    "Strong connectivity between activist and media nodes",
                    "Government node acts as stabilizer",
                    "Corporate interests show defensive positioning"
                ]
            }

        report = SimulationReport(**report_data)

        return SimulationResponse(
            scenario_id=scenario_id,
            steps=steps,
            report=report
        )

    except Exception as e:
        # Fallback: return minimal response
        steps = _generate_mock_steps()
        report = SimulationReport(
            prediction="Unable to generate detailed prediction",
            main_driver="Unknown",
            top_influencers=[],
            spread_level="medium",
            confidence=0.3,
            timeline_summary=[],
            graph_observations=[]
        )
        return SimulationResponse(
            scenario_id=input_data.scenario_id,
            steps=steps,
            report=report
        )
