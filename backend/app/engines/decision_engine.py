"""Crisis decision engine — ranked action scoring.

ActionScore(a) = η₁·RiskReduction + η₂·Feasibility + η₃·Timeliness
                 − η₄·Cost − η₅·SecondOrderRisk
"""
from app.config.crisis_constants import ACTION_WEIGHTS
from app.schemas.crisis_outputs import RankedAction


def action_score(
    risk_reduction: float,
    feasibility: float,
    timeliness: float,
    cost: float,
    second_order_risk: float,
) -> float:
    """Compute composite action utility score."""
    return round(
        ACTION_WEIGHTS.risk_reduction * risk_reduction
        + ACTION_WEIGHTS.feasibility * feasibility
        + ACTION_WEIGHTS.timeliness * timeliness
        - ACTION_WEIGHTS.cost * cost
        - ACTION_WEIGHTS.second_order_risk * second_order_risk,
        4,
    )


def build_ranked_actions() -> list[RankedAction]:
    """Build and rank crisis response actions for GCC scenario."""
    candidates = [
        {
            "action_id": "reroute_cargo",
            "label": "Reroute Cargo Through Lower-Stress Hubs",
            "risk_reduction": 0.74,
            "feasibility": 0.70,
            "timeliness": 0.82,
            "cost": 0.44,
            "second_order_risk": 0.28,
            "rationale": (
                "Reduces airport concentration risk and downstream "
                "delay pressure."
            ),
        },
        {
            "action_id": "issue_advisory",
            "label": "Issue Official Advisory and Stabilization Guidance",
            "risk_reduction": 0.58,
            "feasibility": 0.92,
            "timeliness": 0.94,
            "cost": 0.12,
            "second_order_risk": 0.18,
            "rationale": (
                "Dampens sentiment propagation and reduces panic "
                "amplification."
            ),
        },
        {
            "action_id": "hedge_fuel",
            "label": "Hedge Fuel Exposure for Aviation and Logistics",
            "risk_reduction": 0.68,
            "feasibility": 0.63,
            "timeliness": 0.60,
            "cost": 0.52,
            "second_order_risk": 0.24,
            "rationale": (
                "Improves resilience against short-horizon fuel price "
                "transmission."
            ),
        },
        {
            "action_id": "activate_crisis_response",
            "label": "Activate GCC Crisis Response Coordination",
            "risk_reduction": 0.82,
            "feasibility": 0.55,
            "timeliness": 0.70,
            "cost": 0.38,
            "second_order_risk": 0.15,
            "rationale": (
                "Cross-border coordination reduces cascading failures "
                "across interconnected Gulf systems."
            ),
        },
        {
            "action_id": "prioritize_airport_slots",
            "label": "Prioritize Critical Airport Slot Allocation",
            "risk_reduction": 0.62,
            "feasibility": 0.78,
            "timeliness": 0.88,
            "cost": 0.22,
            "second_order_risk": 0.20,
            "rationale": (
                "Reduces congestion at high-stress hubs and maintains "
                "cargo throughput."
            ),
        },
    ]

    ranked = []
    for item in candidates:
        score = action_score(
            item["risk_reduction"],
            item["feasibility"],
            item["timeliness"],
            item["cost"],
            item["second_order_risk"],
        )
        ranked.append(RankedAction(**item, action_score=score))

    return sorted(ranked, key=lambda x: x.action_score, reverse=True)
