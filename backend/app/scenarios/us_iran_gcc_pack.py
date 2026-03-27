"""US–Iran Escalation Impact on GCC Aviation, Energy, and Trade.

Decision rehearsal scenario pack — resilience planning, stress-testing,
and decision support. NOT military targeting or tactical operations.
"""
from app.schemas.crisis_common import CrisisNode, CrisisEdge, ScenarioBranch
from app.schemas.crisis_scenarios import ScenarioPack
from app.scenarios.airport_nodes_gcc import AIRPORTS_GCC


def build_airport_nodes():
    """Convert raw airport dicts into CrisisNode instances."""
    nodes = []
    for airport in AIRPORTS_GCC:
        nodes.append(
            CrisisNode(
                id=airport["id"],
                label=airport["label"],
                node_type="airport",
                country=airport["country"],
                tags=["aviation", "gcc", "tier1"],
                criticality=airport["hub_importance"],
                vulnerability=0.55,
                exposure=0.72,
                metadata={
                    "code": airport["code"],
                    "city": airport["city"],
                    "cargo_relevance": airport["cargo_relevance"],
                    "fuel_relevance": airport["fuel_relevance"],
                },
            )
        )
    return nodes


def get_us_iran_gcc_pack() -> ScenarioPack:
    """Build the complete US–Iran GCC crisis scenario pack."""
    nodes = build_airport_nodes() + [
        CrisisNode(
            id="country_usa", label="United States", node_type="country",
            criticality=0.95, vulnerability=0.20, exposure=0.30,
        ),
        CrisisNode(
            id="country_iran", label="Iran", node_type="country",
            criticality=0.90, vulnerability=0.50, exposure=0.70,
        ),
        CrisisNode(
            id="energy_oil", label="Crude Oil", node_type="price_signal",
            criticality=0.92, vulnerability=0.60, exposure=0.90,
        ),
        CrisisNode(
            id="energy_fuel", label="Refined Fuel", node_type="price_signal",
            criticality=0.90, vulnerability=0.65, exposure=0.88,
        ),
        CrisisNode(
            id="trade_crossborder", label="Cross-Border Trade",
            node_type="ecommerce_hub",
            criticality=0.82, vulnerability=0.55, exposure=0.72,
        ),
        CrisisNode(
            id="social_panic", label="Public Sentiment Stress",
            node_type="social_narrative",
            criticality=0.75, vulnerability=0.70, exposure=0.68,
        ),
        CrisisNode(
            id="event_escalation", label="Regional Escalation Event",
            node_type="disruption_event",
            criticality=0.94, vulnerability=0.10, exposure=0.95,
        ),
    ]

    edges = [
        CrisisEdge(source="event_escalation", target="energy_oil",
                    edge_type="affects", weight=0.92),
        CrisisEdge(source="energy_oil", target="energy_fuel",
                    edge_type="affects", weight=0.84),
        CrisisEdge(source="energy_fuel", target="airport_dxb",
                    edge_type="supplies", weight=0.72),
        CrisisEdge(source="energy_fuel", target="airport_doh",
                    edge_type="supplies", weight=0.72),
        CrisisEdge(source="energy_fuel", target="airport_kwi",
                    edge_type="supplies", weight=0.68),
        CrisisEdge(source="energy_fuel", target="airport_ruh",
                    edge_type="supplies", weight=0.69),
        CrisisEdge(source="energy_fuel", target="airport_dmm",
                    edge_type="supplies", weight=0.71),
        CrisisEdge(source="energy_fuel", target="airport_jed",
                    edge_type="supplies", weight=0.66),
        CrisisEdge(source="energy_fuel", target="airport_auh",
                    edge_type="supplies", weight=0.70),
        CrisisEdge(source="energy_fuel", target="airport_bah",
                    edge_type="supplies", weight=0.64),
        CrisisEdge(source="energy_fuel", target="airport_mct",
                    edge_type="supplies", weight=0.62),
        CrisisEdge(source="event_escalation", target="social_panic",
                    edge_type="amplifies", weight=0.74),
        CrisisEdge(source="social_panic", target="trade_crossborder",
                    edge_type="delays", weight=0.55),
        CrisisEdge(source="trade_crossborder", target="airport_dxb",
                    edge_type="depends_on", weight=0.71),
        CrisisEdge(source="trade_crossborder", target="airport_doh",
                    edge_type="depends_on", weight=0.63),
        CrisisEdge(source="trade_crossborder", target="airport_jed",
                    edge_type="depends_on", weight=0.58),
        CrisisEdge(source="country_usa", target="event_escalation",
                    edge_type="affects", weight=0.88),
        CrisisEdge(source="country_iran", target="event_escalation",
                    edge_type="affects", weight=0.90),
        CrisisEdge(source="event_escalation", target="trade_crossborder",
                    edge_type="delays", weight=0.65),
    ]

    branches = [
        ScenarioBranch(
            branch_id="baseline_tension",
            label="Baseline Tension",
            description="Elevated tension, no major infrastructure disruption.",
            initial_weight=0.24,
            triggers=["media concern", "insurance repricing"],
        ),
        ScenarioBranch(
            branch_id="contained_strike",
            label="Contained Strike",
            description="Limited confrontation, localized operational shock.",
            initial_weight=0.20,
            triggers=["localized disruption", "short-lived oil shock"],
        ),
        ScenarioBranch(
            branch_id="regional_escalation",
            label="Regional Escalation",
            description="Wider disruption across airspace, energy, and logistics.",
            initial_weight=0.22,
            triggers=["airspace restrictions", "fuel stress"],
        ),
        ScenarioBranch(
            branch_id="maritime_disruption",
            label="Maritime Disruption",
            description="Shipping route stress and transport delay amplification.",
            initial_weight=0.16,
            triggers=["shipping disruption", "import stress"],
        ),
        ScenarioBranch(
            branch_id="infrastructure_shock",
            label="Infrastructure Shock",
            description=(
                "Operational shock to energy-adjacent assets and "
                "downstream systems."
            ),
            initial_weight=0.10,
            triggers=["fuel stress", "airport turnaround disruption"],
        ),
        ScenarioBranch(
            branch_id="diplomatic_deescalation",
            label="Diplomatic De-escalation",
            description="Rapid containment and gradual normalization.",
            initial_weight=0.08,
            triggers=["official stabilization", "market normalization"],
        ),
    ]

    return ScenarioPack(
        scenario_id="us_iran_gcc_escalation",
        title=(
            "US\u2013Iran Escalation Impact on GCC Aviation, "
            "Energy, and Trade"
        ),
        description=(
            "Decision rehearsal scenario for GCC aviation, energy, trade, "
            "and sentiment propagation."
        ),
        categories=["geopolitical", "aviation", "energy", "trade", "social"],
        airports=[a["code"] for a in AIRPORTS_GCC],
        nodes=nodes,
        edges=edges,
        branches=branches,
        base_weights={
            "aviation": 0.28,
            "energy": 0.32,
            "trade": 0.18,
            "social": 0.12,
            "macro": 0.10,
        },
    )
