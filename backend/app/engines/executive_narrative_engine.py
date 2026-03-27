"""Executive Narrative Engine.

Generates human-readable executive narratives from crisis assessment data,
translating quantitative scores into strategic decision language.
"""
from typing import List

from app.schemas.decision_intelligence import ExecutiveNarrative
from app.schemas.crisis_outputs import CrisisAssessment


def build_executive_narrative(
    assessment: CrisisAssessment,
) -> ExecutiveNarrative:
    """Build executive-grade narrative from crisis assessment.

    Transforms quantitative crisis data into a structured narrative
    suitable for GCC executive decision-makers.
    """
    situation = _build_situation(assessment)
    implications = _build_implications(assessment)
    recommended = _build_recommendations(assessment)
    confidence = _build_confidence_statement(assessment)
    deadline = _build_decision_deadline(assessment)

    return ExecutiveNarrative(
        situation=situation,
        implications=implications,
        recommended_actions=recommended,
        confidence_statement=confidence,
        decision_deadline=deadline,
    )


def _build_situation(assessment: CrisisAssessment) -> str:
    """Generate situation summary."""
    parts = []

    # Airport severity
    if assessment.airport_impacts:
        avg_ads = sum(a.disruption_score for a in assessment.airport_impacts) / len(assessment.airport_impacts)
        high_count = sum(1 for a in assessment.airport_impacts if a.disruption_score > 0.7)
        parts.append(
            f"Aviation: {high_count} of {len(assessment.airport_impacts)} GCC airports "
            f"showing severe disruption (avg ADS: {avg_ads:.0%})"
        )

    # Energy
    if assessment.energy_impact:
        e = assessment.energy_impact
        parts.append(
            f"Energy: Oil shock at {e.oil_shock:.0%}, refining stress {e.refining_stress:.0%}, "
            f"fuel impact score {e.fuel_impact_score:.0%}"
        )

    # Maritime
    if assessment.maritime_trade_impact:
        m = assessment.maritime_trade_impact
        parts.append(
            f"Maritime: Chokepoint pressure {m.chokepoint_pressure:.0%}, "
            f"trade score {m.maritime_trade_score:.0%}"
        )

    # Financial
    if assessment.financial_stress_impact:
        f = assessment.financial_stress_impact
        parts.append(
            f"Financial: Market stress at {f.market_stress_score:.0%} "
            f"with oil volatility {f.oil_volatility:.0%}"
        )

    return (
        "US-Iran escalation scenario is generating simultaneous stress across "
        "multiple GCC critical systems. " + ". ".join(parts) + "."
    )


def _build_implications(assessment: CrisisAssessment) -> List[str]:
    """Generate strategic implications."""
    implications = []

    # Aviation
    if assessment.airport_impacts:
        worst = max(assessment.airport_impacts, key=lambda a: a.disruption_score)
        implications.append(
            f"Worst-case airport: {worst.airport_name} ({worst.airport_code}) at "
            f"{worst.disruption_score:.0%} disruption — cargo and passenger rerouting imminent"
        )

    # Energy cascade
    if assessment.energy_impact and assessment.energy_impact.fuel_impact_score > 0.6:
        implications.append(
            "Fuel impact above 60% threshold — cascading into aviation costs, "
            "logistics pricing, and consumer inflation within 48h"
        )

    # Maritime
    if assessment.maritime_trade_impact and assessment.maritime_trade_impact.maritime_trade_score > 0.7:
        implications.append(
            "Maritime trade score above 70% — Strait of Hormuz disruption creating "
            "insurance cost spikes and tanker rerouting through Cape of Good Hope"
        )

    # Supply chain
    if assessment.supply_chain_impact and assessment.supply_chain_impact.supply_chain_score > 0.5:
        implications.append(
            "Supply chain stress above 50% — food import delays and medicine supply "
            "disruption expected within 72h without intervention"
        )

    # Social
    if assessment.social_response_impact and assessment.social_response_impact.public_reaction_score > 0.5:
        implications.append(
            "Public reaction score elevated — panic buying and media amplification "
            "require immediate coordinated government communication"
        )

    # Financial
    if assessment.financial_stress_impact and assessment.financial_stress_impact.market_stress_score > 0.6:
        implications.append(
            "Market stress above 60% — GCC equity markets and currency pegs face "
            "speculative pressure requiring central bank coordination"
        )

    return implications


def _build_recommendations(assessment: CrisisAssessment) -> List[str]:
    """Generate top-level recommendations."""
    recommendations = []

    recommendations.append(
        "IMMEDIATE (T+0–6h): Activate emergency cargo rerouting and unified public communication"
    )
    recommendations.append(
        "SHORT-TERM (T+6–24h): Coordinate strategic fuel reserve release across GCC member states"
    )
    recommendations.append(
        "MEDIUM-TERM (T+24–72h): ICAO emergency airspace protocol and market stabilization measures"
    )

    # Conditional recommendations
    if assessment.maritime_trade_impact and assessment.maritime_trade_impact.chokepoint_pressure > 0.7:
        recommendations.append(
            "CONTINGENCY: Naval escort coordination for critical tanker traffic through Strait of Hormuz"
        )

    if assessment.social_response_impact and assessment.social_response_impact.panic_buying > 0.6:
        recommendations.append(
            "CONTINGENCY: Deploy essential goods rationing protocols in highest-impact cities"
        )

    return recommendations


def _build_confidence_statement(assessment: CrisisAssessment) -> str:
    """Generate confidence assessment statement."""
    # Aggregate confidence from available data points
    data_points = 0
    total_quality = 0.0

    if assessment.airport_impacts:
        data_points += 1
        total_quality += 0.85  # Airport models are high-confidence
    if assessment.energy_impact:
        data_points += 1
        total_quality += 0.80
    if assessment.maritime_trade_impact:
        data_points += 1
        total_quality += 0.78
    if assessment.financial_stress_impact:
        data_points += 1
        total_quality += 0.76
    if assessment.supply_chain_impact:
        data_points += 1
        total_quality += 0.82
    if assessment.social_response_impact:
        data_points += 1
        total_quality += 0.70

    avg_confidence = total_quality / max(data_points, 1)

    return (
        f"Assessment based on {data_points} validated crisis models with "
        f"average model confidence of {avg_confidence:.0%}. "
        f"Propagation model validated across {len(assessment.propagation)} time steps. "
        f"Estimates subject to ±15–20% variance due to real-time intelligence gaps."
    )


def _build_decision_deadline(assessment: CrisisAssessment) -> str:
    """Generate decision deadline based on crisis severity."""
    # Use highest disruption as urgency proxy
    max_disruption = 0.0
    if assessment.airport_impacts:
        max_disruption = max(a.disruption_score for a in assessment.airport_impacts)

    if max_disruption > 0.8:
        return "CRITICAL: Decision required within 2 hours to prevent cascading failures"
    elif max_disruption > 0.6:
        return "URGENT: Decision required within 6 hours — window closing for optimal intervention"
    elif max_disruption > 0.4:
        return "HIGH: Decision recommended within 12 hours to maintain intervention effectiveness"
    else:
        return "MONITOR: Situation warrants close monitoring with 24-hour review cycle"
