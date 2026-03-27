from __future__ import annotations

from app.schemas.analysis import AnalysisQueryRequest
from app.schemas.brief import BriefGenerateRequest
from app.schemas.decision import DecisionComputeRequest
from app.schemas.graph import GraphBuildRequest, GraphEnrichRequest
from app.schemas.scenario import ScenarioNormalizeRequest
from app.schemas.signal import RawSource, SignalExtractionRequest
from app.schemas.simulation import SimulationRunRequest
from app.services.analysis_service import AnalysisService
from app.services.brief_service import BriefService
from app.services.decision_service import DecisionService
from app.services.graph_service import GraphService
from app.services.scenario_service import ScenarioService
from app.services.signal_service import SignalService
from app.services.simulation_service import SimulationService


def test_full_vertical_slice_end_to_end() -> None:
    """
    Validates the full Deevo reasoning chain:

    1. normalize scenario
    2. extract signals
    3. build graph
    4. enrich graph
    5. run simulation
    6. compute decision
    7. generate brief
    8. query analysis
    """

    # ------------------------------------------------------------------
    # Services
    # ------------------------------------------------------------------
    scenario_service = ScenarioService()
    signal_service = SignalService()
    graph_service = GraphService()
    simulation_service = SimulationService()
    decision_service = DecisionService()
    brief_service = BriefService()
    analysis_service = AnalysisService()

    # ------------------------------------------------------------------
    # 1. Normalize Scenario
    # ------------------------------------------------------------------
    scenario_payload = ScenarioNormalizeRequest(
        raw_text=(
            "Iran-US escalation causes GCC airspace restrictions, airport stress, "
            "oil volatility, and logistics spillover across regional trade routes."
        ),
        region_hint="GCC",
        domain_hint="aviation",
    )

    normalized = scenario_service.normalize(scenario_payload)

    assert normalized.scenario_id
    assert normalized.title
    assert normalized.region == "GCC"
    assert normalized.domain == "aviation"
    assert normalized.trigger.type in {
        "airspace",
        "market",
        "military",
        "policy",
        "shipping",
        "banking",
        "social",
    }
    assert 0.0 <= normalized.confidence <= 1.0

    # ------------------------------------------------------------------
    # 2. Extract Signals
    # ------------------------------------------------------------------
    signal_payload = SignalExtractionRequest(
        scenario_id=normalized.scenario_id,
        raw_sources=[
            RawSource(
                source_type="news",
                source_name="regional_news",
                content=(
                    "Regional airspace advisories and rerouting pressures are intensifying "
                    "for GCC hub airports."
                ),
            ),
            RawSource(
                source_type="market_feed",
                source_name="commodities_feed",
                content="Oil prices and gold are rising as geopolitical risk increases.",
            ),
        ],
    )

    signal_response = signal_service.extract(signal_payload)

    assert signal_response.scenario_id == normalized.scenario_id
    assert signal_response.extracted_count >= 1
    assert len(signal_response.signals) >= 1
    assert all(0.0 <= signal.confidence <= 1.0 for signal in signal_response.signals)

    # ------------------------------------------------------------------
    # 3. Build Graph
    # ------------------------------------------------------------------
    graph_build_payload = GraphBuildRequest(
        scenario_id=normalized.scenario_id,
        normalized_scenario=normalized.model_dump(),
        signals=[signal.model_dump() for signal in signal_response.signals],
    )

    graph_response = graph_service.build(graph_build_payload)

    assert graph_response.scenario_id == normalized.scenario_id
    assert len(graph_response.nodes) >= 1
    assert len(graph_response.edges) >= 1
    assert 0.0 <= graph_response.confidence <= 1.0

    # ------------------------------------------------------------------
    # 4. Enrich Graph
    # ------------------------------------------------------------------
    graph_enrich_payload = GraphEnrichRequest(
        scenario_id=normalized.scenario_id,
        nodes=graph_response.nodes,
        edges=graph_response.edges,
        signals=[signal.model_dump() for signal in signal_response.signals],
    )

    enriched_graph = graph_service.enrich(graph_enrich_payload)

    assert enriched_graph.scenario_id == normalized.scenario_id
    assert len(enriched_graph.nodes) == len(graph_response.nodes)
    assert len(enriched_graph.edges) == len(graph_response.edges)
    assert all(0.0 <= node.influence_score <= 1.0 for node in enriched_graph.nodes)
    assert all(0.0 <= node.trust_score <= 1.0 for node in enriched_graph.nodes)
    assert all(0.0 <= node.propagation_score <= 1.0 for node in enriched_graph.nodes)

    # ------------------------------------------------------------------
    # 5. Run Simulation
    # ------------------------------------------------------------------
    simulation_payload = SimulationRunRequest(
        scenario_id=normalized.scenario_id,
        normalized_scenario=normalized.model_dump(),
        signals=[signal.model_dump() for signal in signal_response.signals],
        nodes=[node.model_dump() for node in graph_response.nodes],
        edges=[edge.model_dump() for edge in graph_response.edges],
        agent_profiles=[
            {
                "id": node.id,
                "role": node.type,
                "influence_score": node.influence_score,
                "trust_score": node.trust_score,
                "propagation_score": node.propagation_score,
                "stance": node.stance,
                "reaction_delay_hours": 1,
                "amplification_factor": 0.7,
                "preferred_channel": "aviation_ops",
                "emotional_state": "stable",
                "memory_state": {},
            }
            for node in enriched_graph.nodes
        ],
        strategy="transparent",
    )

    simulation_response = simulation_service.run(simulation_payload)

    assert simulation_response.scenario_id == normalized.scenario_id
    assert len(simulation_response.phases) >= 2
    assert 0.0 <= simulation_response.spread_velocity <= 1.0
    assert simulation_response.critical_window
    assert 0.0 <= simulation_response.confidence <= 1.0

    for phase in simulation_response.phases:
        assert 0.0 <= phase.airport_stress <= 1.0
        assert 0.0 <= phase.shipping_stress <= 1.0
        assert 0.0 <= phase.banking_stress <= 1.0
        assert 0.0 <= phase.media_stress <= 1.0
        assert 0.0 <= phase.public_stress <= 1.0
        assert 0.0 <= phase.energy_stress <= 1.0
        assert 0.0 <= phase.market_stress <= 1.0
        assert 0.0 <= phase.logistics_stress <= 1.0
        assert 0.0 <= phase.policy_stress <= 1.0
        assert 0.0 <= phase.total_risk_score <= 1.0

    # ------------------------------------------------------------------
    # 6. Compute Decision
    # ------------------------------------------------------------------
    decision_payload = DecisionComputeRequest(
        scenario_id=normalized.scenario_id,
        simulation_response=simulation_response.model_dump(),
    )

    decision_output = decision_service.compute(decision_payload)

    assert decision_output.scenario_id == normalized.scenario_id
    assert decision_output.risk_level in {"Low", "Medium", "High", "Critical"}
    assert 0.0 <= decision_output.risk_score <= 1.0
    assert 0.0 <= decision_output.spread_velocity <= 1.0
    assert decision_output.primary_driver
    assert decision_output.critical_window
    assert decision_output.financial_impact.low >= 0
    assert decision_output.financial_impact.high >= decision_output.financial_impact.low
    assert 0.0 <= decision_output.customer_impact.passenger_confidence_risk <= 1.0
    assert 0.0 <= decision_output.customer_impact.churn_risk <= 1.0
    assert 0.0 <= decision_output.regulatory_risk <= 1.0
    assert 0.0 <= decision_output.reputation_score <= 1.0
    assert len(decision_output.recommended_actions) >= 1
    assert 0.0 <= decision_output.confidence <= 1.0

    # ------------------------------------------------------------------
    # 7. Generate Brief
    # ------------------------------------------------------------------
    brief_payload = BriefGenerateRequest(
        scenario_id=normalized.scenario_id,
        decision_output=decision_output.model_dump(),
        simulation_response=simulation_response.model_dump(),
        signals=[signal.model_dump() for signal in signal_response.signals],
    )

    brief = brief_service.generate(brief_payload)

    assert brief.scenario_id == normalized.scenario_id
    assert brief.scenario_summary
    assert brief.timeline_narrative
    assert len(brief.key_drivers) >= 1
    assert len(brief.entity_influence) >= 1
    assert brief.forecast.base_case
    assert brief.forecast.pessimistic_case
    assert brief.forecast.controlled_response_case
    assert brief.business_impact.airports
    assert brief.business_impact.logistics
    assert brief.business_impact.tourism
    assert brief.business_impact.banking
    assert 0.0 <= brief.confidence <= 1.0

    # ------------------------------------------------------------------
    # 8. Query Analysis
    # ------------------------------------------------------------------
    analysis_payload = AnalysisQueryRequest(
        scenario_id=normalized.scenario_id,
        question="What is driving the next 24h airport stress?",
        decision_output=decision_output.model_dump(),
        intelligence_brief=brief.model_dump(),
        simulation_response=simulation_response.model_dump(),
    )

    analysis = analysis_service.answer(analysis_payload)

    assert analysis.scenario_id == normalized.scenario_id
    assert analysis.answer
    assert len(analysis.top_drivers) >= 1
    assert len(analysis.top_entities) >= 1
    assert len(analysis.counterfactuals) >= 1
    assert 0.0 <= analysis.confidence <= 1.0


def test_analysis_forecast_question_path() -> None:
    """
    Validates that analysis changes behavior for a forecast-style question.
    """
    analysis_service = AnalysisService()

    payload = AnalysisQueryRequest(
        scenario_id="scn_test_001",
        question="What happens next in the next 24 hours?",
        decision_output={
            "primary_driver": "Airspace restriction and reroute amplification",
            "critical_window": "T0-T1",
            "confidence": 0.78,
        },
        intelligence_brief={
            "forecast": {
                "base_case": "Airport stress remains elevated for 24h.",
                "pessimistic_case": "Escalating cancellations and cargo delay.",
                "controlled_response_case": "Improvement under transparent communication.",
            }
        },
        simulation_response={
            "phases": [
                {
                    "phase": "T1",
                    "label": "Operational disruption",
                    "airport_stress": 0.68,
                    "shipping_stress": 0.27,
                    "banking_stress": 0.12,
                    "media_stress": 0.43,
                    "public_stress": 0.35,
                    "energy_stress": 0.58,
                    "market_stress": 0.56,
                    "logistics_stress": 0.49,
                    "policy_stress": 0.32,
                    "total_risk_score": 0.51,
                }
            ],
            "airport_states": [],
            "sector_states": [],
        },
    )

    response = analysis_service.answer(payload)

    assert "Base case" in response.answer or "base case" in response.answer.lower()
    assert response.confidence > 0
