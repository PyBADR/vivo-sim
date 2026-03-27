"""Decision Intelligence Engine.

Transforms crisis assessment outputs into decision-grade intelligence:
  Assessment → Decision Options → Critical Nodes → Decision Windows → Bundle
"""
from typing import List, Dict, Optional

from app.schemas.decision_intelligence import (
    DecisionOption,
    DecisionWindow,
    CriticalNode,
    ConfidenceBand,
    DecisionIntelligenceBundle,
)
from app.schemas.crisis_outputs import (
    CrisisAssessment,
    NodeImpact,
)


# ── Decision Option Templates ──────────────────────────────────────
_OPTION_TEMPLATES = [
    {
        "option_id": "opt_cargo_reroute",
        "title": "Emergency Cargo Rerouting",
        "description": "Activate pre-negotiated cargo rerouting agreements through Oman and East Africa corridors.",
        "cost_estimate": "$12M–18M over 72h",
        "time_to_implement": "4–8 hours",
        "trade_offs": [
            "Increased transit time by 24–48h",
            "Higher fuel costs per tonne-km",
            "Capacity constraints at secondary hubs",
        ],
        "dependencies": ["Oman airspace clearance", "Secondary hub capacity"],
        "recommendation": "strongly_recommended",
        "base_risk_reduction": 0.72,
        "base_confidence": 0.85,
    },
    {
        "option_id": "opt_fuel_reserve",
        "title": "Strategic Fuel Reserve Activation",
        "description": "Release 15-day strategic petroleum reserves across GCC member states.",
        "cost_estimate": "$280M–340M drawdown",
        "time_to_implement": "12–24 hours",
        "trade_offs": [
            "Reduces strategic buffer below 60-day threshold",
            "Signals severity to markets, possible panic amplification",
            "Requires coordinated GCC ministerial approval",
        ],
        "dependencies": ["GCC Energy Council approval", "Distribution logistics readiness"],
        "recommendation": "recommended",
        "base_risk_reduction": 0.65,
        "base_confidence": 0.78,
    },
    {
        "option_id": "opt_airspace_protocol",
        "title": "Activate ICAO Emergency Airspace Protocol",
        "description": "Coordinate with ICAO for emergency corridor designation over neutral airspace.",
        "cost_estimate": "$2M–4M coordination costs",
        "time_to_implement": "6–12 hours",
        "trade_offs": [
            "Requires multilateral agreement",
            "Reduced capacity through narrow corridors",
            "Increased ATC workload",
        ],
        "dependencies": ["ICAO coordination", "Neutral state agreement"],
        "recommendation": "strongly_recommended",
        "base_risk_reduction": 0.58,
        "base_confidence": 0.82,
    },
    {
        "option_id": "opt_market_stabilize",
        "title": "Coordinated Market Stabilization",
        "description": "Central bank coordination to inject liquidity and stabilize currency/bond markets.",
        "cost_estimate": "$1.2B–2.5B intervention",
        "time_to_implement": "2–6 hours",
        "trade_offs": [
            "Burns foreign reserves",
            "May signal weakness to speculators",
            "Requires synchronized GCC central bank action",
        ],
        "dependencies": ["Central bank coordination", "Forex reserve levels"],
        "recommendation": "conditional",
        "base_risk_reduction": 0.54,
        "base_confidence": 0.71,
    },
    {
        "option_id": "opt_public_comms",
        "title": "Public Communication & Stabilization Campaign",
        "description": "Unified GCC government communication strategy to counter panic and misinformation.",
        "cost_estimate": "$500K–1M",
        "time_to_implement": "1–3 hours",
        "trade_offs": [
            "Risk of premature disclosure",
            "Coordination delay across 6 governments",
            "Message consistency challenges",
        ],
        "dependencies": ["Media coordination", "Unified messaging framework"],
        "recommendation": "strongly_recommended",
        "base_risk_reduction": 0.48,
        "base_confidence": 0.88,
    },
]


# ── Decision Window Templates ──────────────────────────────────────
_WINDOW_TEMPLATES = [
    {
        "window_id": "win_immediate",
        "title": "Immediate Response Window",
        "opens": "T+0h",
        "closes": "T+6h",
        "urgency": "critical",
        "actions_available": ["opt_cargo_reroute", "opt_public_comms", "opt_airspace_protocol"],
        "cost_of_delay": "Each hour of delay increases cargo disruption by ~8% and public panic by ~12%",
    },
    {
        "window_id": "win_short_term",
        "title": "Short-Term Stabilization Window",
        "opens": "T+6h",
        "closes": "T+24h",
        "urgency": "high",
        "actions_available": ["opt_fuel_reserve", "opt_market_stabilize"],
        "cost_of_delay": "Fuel reserve delay past T+24h risks spot market spikes of 35–50%",
    },
    {
        "window_id": "win_medium_term",
        "title": "Medium-Term Adjustment Window",
        "opens": "T+24h",
        "closes": "T+72h",
        "urgency": "medium",
        "actions_available": ["opt_cargo_reroute", "opt_fuel_reserve"],
        "cost_of_delay": "Supply chain cascades become irreversible after 72h without intervention",
    },
]


def build_decision_options(
    assessment: CrisisAssessment,
) -> List[DecisionOption]:
    """Generate decision options calibrated to assessment severity."""
    # Use average disruption score to calibrate risk reduction
    avg_disruption = 0.0
    if assessment.airport_impacts:
        avg_disruption = sum(
            a.disruption_score for a in assessment.airport_impacts
        ) / len(assessment.airport_impacts)

    severity_multiplier = min(1.0, 0.5 + avg_disruption)

    options = []
    for tmpl in _OPTION_TEMPLATES:
        risk_red = min(1.0, tmpl["base_risk_reduction"] * severity_multiplier)
        confidence = tmpl["base_confidence"] * (1.0 - avg_disruption * 0.15)

        options.append(
            DecisionOption(
                option_id=tmpl["option_id"],
                title=tmpl["title"],
                description=tmpl["description"],
                risk_reduction=round(risk_red, 4),
                cost_estimate=tmpl["cost_estimate"],
                time_to_implement=tmpl["time_to_implement"],
                confidence=round(max(0.5, min(1.0, confidence)), 4),
                trade_offs=tmpl["trade_offs"],
                dependencies=tmpl["dependencies"],
                recommendation=tmpl["recommendation"],
            )
        )

    # Sort by risk_reduction descending
    options.sort(key=lambda o: o.risk_reduction, reverse=True)
    return options


def build_critical_nodes(
    assessment: CrisisAssessment,
) -> List[CriticalNode]:
    """Identify critical nodes with highest cascade risk."""
    if not assessment.node_impacts:
        return []

    # Build edge count from node ripple effects
    critical = []
    for ni in assessment.node_impacts:
        cascade = ni.probability_of_disruption * ni.severity_score
        downstream = len(ni.ripple_effect)

        # Intervention options based on node type
        interventions = _get_interventions(ni.node_type)

        critical.append(
            CriticalNode(
                node_id=ni.node_id,
                label=ni.label,
                node_type=ni.node_type,
                criticality_score=round(ni.severity_score, 4),
                cascade_risk=round(min(1.0, cascade), 4),
                downstream_count=downstream,
                intervention_options=interventions,
                country=ni.country,
            )
        )

    # Sort by cascade_risk descending, take top 10
    critical.sort(key=lambda c: c.cascade_risk, reverse=True)
    return critical[:10]


def build_decision_windows(
    assessment: CrisisAssessment,
) -> List[DecisionWindow]:
    """Build time-bound decision windows from templates."""
    return [
        DecisionWindow(**tmpl) for tmpl in _WINDOW_TEMPLATES
    ]


def build_confidence_bands(
    assessment: CrisisAssessment,
) -> List[ConfidenceBand]:
    """Generate confidence bands for key metrics."""
    bands = []

    # Airport disruption confidence
    if assessment.airport_impacts:
        scores = [a.disruption_score for a in assessment.airport_impacts]
        avg = sum(scores) / len(scores)
        bands.append(ConfidenceBand(
            metric="Airport Disruption (avg)",
            lower_bound=round(avg * 0.82, 4),
            central_estimate=round(avg, 4),
            upper_bound=round(min(1.0, avg * 1.18), 4),
            confidence_level=0.85,
        ))

    # Energy impact confidence
    if assessment.energy_impact:
        e = assessment.energy_impact.fuel_impact_score
        bands.append(ConfidenceBand(
            metric="Fuel Impact Score",
            lower_bound=round(e * 0.78, 4),
            central_estimate=round(e, 4),
            upper_bound=round(min(1.0, e * 1.22), 4),
            confidence_level=0.80,
        ))

    # Maritime trade confidence
    if assessment.maritime_trade_impact:
        m = assessment.maritime_trade_impact.maritime_trade_score
        bands.append(ConfidenceBand(
            metric="Maritime Trade Score",
            lower_bound=round(m * 0.75, 4),
            central_estimate=round(m, 4),
            upper_bound=round(min(1.0, m * 1.25), 4),
            confidence_level=0.78,
        ))

    # Financial stress confidence
    if assessment.financial_stress_impact:
        f = assessment.financial_stress_impact.market_stress_score
        bands.append(ConfidenceBand(
            metric="Market Stress Score",
            lower_bound=round(f * 0.80, 4),
            central_estimate=round(f, 4),
            upper_bound=round(min(1.0, f * 1.20), 4),
            confidence_level=0.76,
        ))

    # Supply chain confidence
    if assessment.supply_chain_impact:
        s = assessment.supply_chain_impact.supply_chain_score
        bands.append(ConfidenceBand(
            metric="Supply Chain Score",
            lower_bound=round(s * 0.80, 4),
            central_estimate=round(s, 4),
            upper_bound=round(min(1.0, s * 1.20), 4),
            confidence_level=0.82,
        ))

    return bands


def build_decision_bundle(
    assessment: CrisisAssessment,
) -> DecisionIntelligenceBundle:
    """Build the complete Decision Intelligence Bundle."""
    options = build_decision_options(assessment)
    critical = build_critical_nodes(assessment)
    windows = build_decision_windows(assessment)
    bands = build_confidence_bands(assessment)

    # Overall confidence: weighted average of band confidences
    overall = 0.0
    if bands:
        overall = sum(b.confidence_level for b in bands) / len(bands)

    return DecisionIntelligenceBundle(
        scenario_id=assessment.scenario_id,
        decision_options=options,
        decision_windows=windows,
        critical_nodes=critical,
        confidence_bands=bands,
        overall_confidence=round(overall, 4),
    )


def _get_interventions(node_type: str) -> List[str]:
    """Return intervention options based on node type."""
    interventions_map = {
        "airport": ["Reroute traffic", "Activate backup capacity", "Emergency fuel supply"],
        "energy_production": ["Activate reserves", "Switch to secondary sources"],
        "energy_refining": ["Emergency maintenance bypass", "Import refined product"],
        "energy_export": ["Reroute tankers", "Pipeline redirection"],
        "energy_transmission": ["Grid load balancing", "Emergency interconnects"],
        "maritime_chokepoint": ["Naval escort", "Alternative routing"],
        "maritime_port": ["Capacity reallocation", "Extended operating hours"],
        "financial_macro": ["Liquidity injection", "Currency intervention"],
        "financial_liquidity": ["Emergency lending facility", "Repo operations"],
        "financial_pricing": ["Price stabilization mechanism", "Trading halt"],
        "utilities_power": ["Emergency generation", "Load shedding plan"],
        "utilities_water": ["Reserve activation", "Rationing protocol"],
        "utilities_telecom": ["Network prioritization", "Satellite backup"],
        "country": ["Diplomatic channels", "Emergency coordination"],
        "event": ["Containment protocol", "Escalation management"],
        "institution": ["Emergency session", "Authority delegation"],
    }
    return interventions_map.get(node_type, ["Monitor and assess"])
