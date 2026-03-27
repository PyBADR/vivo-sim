import json
from pathlib import Path
from typing import List, Optional

from app.schemas.agent import AgentGenerateInput, AgentGenerateResponse, AgentOut


def _get_seeds_dir() -> Path:
    """Get the seeds directory path."""
    backend_dir = Path(__file__).resolve().parent.parent.parent.parent
    return backend_dir.parent / "seeds"


def _load_gcc_agents() -> Optional[List[dict]]:
    """Load GCC archetype agents from seed data."""
    try:
        seeds_dir = _get_seeds_dir()
        seed_file = seeds_dir / "agents_gcc.json"

        if seed_file.exists():
            with open(seed_file, 'r', encoding='utf-8') as f:
                return json.load(f)
    except Exception:
        pass
    return None


def _generate_default_agents() -> List[AgentOut]:
    """Generate default GCC-style agents."""
    archetypes = [
        ("Activist", "activist", 0.8, "accelerator", "Twitter"),
        ("Government Official", "official", 0.9, "moderator", "Official Statements"),
        ("Corporate CEO", "corporate", 0.75, "influencer", "LinkedIn"),
        ("Media Journalist", "journalist", 0.85, "amplifier", "News"),
        ("Academic", "academic", 0.6, "analyst", "Academic"),
        ("Influencer", "influencer", 0.7, "amplifier", "Instagram"),
    ]

    agents = []
    for i, (name, archetype, influence, behavior, platform) in enumerate(archetypes):
        agent = AgentOut(
            id=f"agent_{i}",
            name=name,
            archetype=archetype,
            influence_score=influence,
            behavior_type=behavior,
            platform=platform,
            sentiment=0.5 + (i % 3) * 0.2,  # Varied sentiment
            activity_level=0.6 + (i % 3) * 0.15
        )
        agents.append(agent)

    return agents


async def generate_agents(input_data: AgentGenerateInput) -> AgentGenerateResponse:
    """Generate agents for the scenario."""
    try:
        scenario_id = input_data.scenario_id

        # Try loading GCC agents from seed data
        seed_agents = _load_gcc_agents()

        if seed_agents:
            agents = [AgentOut(**a) for a in seed_agents]
        else:
            agents = _generate_default_agents()

        return AgentGenerateResponse(
            scenario_id=scenario_id,
            agents=agents
        )

    except Exception:
        # Fallback: return default agents
        agents = _generate_default_agents()
        return AgentGenerateResponse(
            scenario_id=input_data.scenario_id,
            agents=agents
        )
