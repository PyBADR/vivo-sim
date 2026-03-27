from typing import List

from app.schemas.simulation import SimulationStep, SimulationReport


async def generate_report(
    steps: List[SimulationStep], scenario_id: str
) -> SimulationReport:
    """Generate a report from simulation steps."""
    if not steps:
        return SimulationReport(
            prediction="No data available",
            main_driver="Unknown",
            top_influencers=[],
            spread_level="low",
            confidence=0.0,
            timeline_summary=[],
            graph_observations=[]
        )

    # Extract key metrics from steps
    avg_sentiment = sum(s.sentiment_score for s in steps) / len(steps)
    max_visibility = max(s.visibility_score for s in steps)
    peak_step = max(steps, key=lambda s: s.visibility_score)

    # Collect agents mentioned in actions
    influencers = set()
    for step in steps:
        for action in step.agent_actions:
            influencers.add(action.agent_id)

    # Generate prediction based on trajectory
    if max_visibility > 0.8:
        spread_level = "high"
    elif max_visibility > 0.5:
        spread_level = "medium"
    else:
        spread_level = "low"

    if avg_sentiment < 0.35:
        prediction = "Negative sentiment dominates; expect continued polarization"
    elif avg_sentiment < 0.65:
        prediction = "Mixed sentiment with potential for escalation or resolution"
    else:
        prediction = "Positive trajectory toward resolution"

    timeline = [
        f"Step 1 ({steps[0].label}): Initial phase at {steps[0].visibility_score:.0%} visibility",
        f"Step 2 ({steps[1].label}): Growth phase at {steps[1].visibility_score:.0%} visibility",
        f"Step 3 ({steps[2].label}): Peak phase at {steps[2].visibility_score:.0%} visibility",
        f"Step 4 ({steps[3].label}): Decline phase at {steps[3].visibility_score:.0%} visibility"
    ] if len(steps) >= 4 else []

    return SimulationReport(
        prediction=prediction,
        main_driver="Social media and influencer amplification",
        top_influencers=list(influencers)[:5],
        spread_level=spread_level,
        confidence=min(0.9, max_visibility),
        timeline_summary=timeline,
        graph_observations=[
            f"Peak visibility reached at {peak_step.label} phase",
            f"Average sentiment: {avg_sentiment:.2f}",
            f"Escalation pattern identified across {len(steps)} phases"
        ]
    )
