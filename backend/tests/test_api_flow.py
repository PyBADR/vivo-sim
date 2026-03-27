from __future__ import annotations

from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_api_full_flow() -> None:
    # ------------------------------------------------------------
    # 1. Normalize scenario
    # ------------------------------------------------------------
    normalize_payload = {
        "raw_text": (
            "Iran-US escalation causes GCC airspace restrictions, airport stress, "
            "oil volatility, and logistics spillover across regional trade routes."
        ),
        "region_hint": "GCC",
        "domain_hint": "aviation",
    }

    normalize_response = client.post("/api/v1/scenario/normalize", json=normalize_payload)
    assert normalize_response.status_code == 200, normalize_response.text

    normalized = normalize_response.json()
    assert normalized["scenario_id"]
    assert normalized["title"]
    assert normalized["region"] == "GCC"
    assert normalized["domain"] == "aviation"
    assert 0.0 <= normalized["confidence"] <= 1.0

    scenario_id = normalized["scenario_id"]

    # ------------------------------------------------------------
    # 2. Extract signals
    # ------------------------------------------------------------
    signals_payload = {
        "scenario_id": scenario_id,
        "raw_sources": [
            {
                "source_type": "news",
                "source_name": "regional_news",
                "content": (
                    "Regional airspace advisories and rerouting pressures are intensifying "
                    "for GCC hub airports."
                ),
            },
            {
                "source_type": "market_feed",
                "source_name": "commodities_feed",
                "content": "Oil prices and gold are rising as geopolitical risk increases.",
            },
        ],
    }

    signals_response = client.post("/api/v1/signals/extract", json=signals_payload)
    assert signals_response.status_code == 200, signals_response.text

    signals_data = signals_response.json()
    assert signals_data["scenario_id"] == scenario_id
    assert signals_data["extracted_count"] >= 1
    assert len(signals_data["signals"]) >= 1
    assert 0.0 <= signals_data["confidence"] <= 1.0

    # ------------------------------------------------------------
    # 3. Build graph
    # ------------------------------------------------------------
    graph_build_payload = {
        "scenario_id": scenario_id,
        "normalized_scenario": normalized,
        "signals": signals_data["signals"],
    }

    graph_build_response = client.post("/api/v1/graph/build", json=graph_build_payload)
    assert graph_build_response.status_code == 200, graph_build_response.text

    graph_data = graph_build_response.json()
    assert graph_data["scenario_id"] == scenario_id
    assert len(graph_data["nodes"]) >= 1
    assert len(graph_data["edges"]) >= 1
    assert 0.0 <= graph_data["confidence"] <= 1.0

    # ------------------------------------------------------------
    # 4. Enrich graph
    # ------------------------------------------------------------
    graph_enrich_payload = {
        "scenario_id": scenario_id,
        "nodes": graph_data["nodes"],
        "edges": graph_data["edges"],
        "signals": signals_data["signals"],
    }

    graph_enrich_response = client.post("/api/v1/graph/enrich", json=graph_enrich_payload)
    assert graph_enrich_response.status_code == 200, graph_enrich_response.text

    enriched_graph = graph_enrich_response.json()
    assert enriched_graph["scenario_id"] == scenario_id
    assert len(enriched_graph["nodes"]) == len(graph_data["nodes"])
    assert len(enriched_graph["edges"]) == len(graph_data["edges"])
    assert 0.0 <= enriched_graph["confidence"] <= 1.0

    for node in enriched_graph["nodes"]:
        assert 0.0 <= node["influence_score"] <= 1.0
        assert 0.0 <= node["trust_score"] <= 1.0
        assert 0.0 <= node["propagation_score"] <= 1.0

    # ------------------------------------------------------------
    # 5. Run simulation
    # ------------------------------------------------------------
    agent_profiles = [
        {
            "id": node["id"],
            "role": node["type"],
            "influence_score": node["influence_score"],
            "trust_score": node["trust_score"],
            "propagation_score": node["propagation_score"],
            "stance": node["stance"],
            "reaction_delay_hours": 1,
            "amplification_factor": 0.7,
            "preferred_channel": "aviation_ops",
            "emotional_state": "stable",
            "memory_state": {},
        }
        for node in enriched_graph["nodes"]
    ]

    simulate_payload = {
        "scenario_id": scenario_id,
        "normalized_scenario": normalized,
        "signals": signals_data["signals"],
        "nodes": graph_data["nodes"],
        "edges": graph_data["edges"],
        "agent_profiles": agent_profiles,
        "strategy": "transparent",
    }

    simulate_response = client.post("/api/v1/simulate/run", json=simulate_payload)
    assert simulate_response.status_code == 200, simulate_response.text

    simulation = simulate_response.json()
    assert simulation["scenario_id"] == scenario_id
    assert len(simulation["phases"]) >= 2
    assert 0.0 <= simulation["spread_velocity"] <= 1.0
    assert simulation["critical_window"]
    assert 0.0 <= simulation["confidence"] <= 1.0

    # ------------------------------------------------------------
    # 6. Compute decision
    # ------------------------------------------------------------
    decision_payload = {
        "scenario_id": scenario_id,
        "simulation_response": simulation,
    }

    decision_response = client.post("/api/v1/decision/compute", json=decision_payload)
    assert decision_response.status_code == 200, decision_response.text

    decision = decision_response.json()
    assert decision["scenario_id"] == scenario_id
    assert decision["risk_level"] in {"Low", "Medium", "High", "Critical"}
    assert 0.0 <= decision["risk_score"] <= 1.0
    assert 0.0 <= decision["spread_velocity"] <= 1.0
    assert decision["primary_driver"]
    assert decision["critical_window"]
    assert decision["financial_impact"]["low"] >= 0
    assert decision["financial_impact"]["high"] >= decision["financial_impact"]["low"]
    assert 0.0 <= decision["customer_impact"]["passenger_confidence_risk"] <= 1.0
    assert 0.0 <= decision["customer_impact"]["churn_risk"] <= 1.0
    assert 0.0 <= decision["regulatory_risk"] <= 1.0
    assert 0.0 <= decision["reputation_score"] <= 1.0
    assert len(decision["recommended_actions"]) >= 1
    assert 0.0 <= decision["confidence"] <= 1.0

    # ------------------------------------------------------------
    # 7. Generate brief
    # ------------------------------------------------------------
    brief_payload = {
        "scenario_id": scenario_id,
        "decision_output": decision,
        "simulation_response": simulation,
        "signals": signals_data["signals"],
    }

    brief_response = client.post("/api/v1/brief/generate", json=brief_payload)
    assert brief_response.status_code == 200, brief_response.text

    brief = brief_response.json()
    assert brief["scenario_id"] == scenario_id
    assert brief["scenario_summary"]
    assert brief["timeline_narrative"]
    assert len(brief["key_drivers"]) >= 1
    assert len(brief["entity_influence"]) >= 1
    assert brief["forecast"]["base_case"]
    assert brief["forecast"]["pessimistic_case"]
    assert brief["forecast"]["controlled_response_case"]
    assert brief["business_impact"]["airports"]
    assert brief["business_impact"]["logistics"]
    assert brief["business_impact"]["tourism"]
    assert brief["business_impact"]["banking"]
    assert 0.0 <= brief["confidence"] <= 1.0

    # ------------------------------------------------------------
    # 8. Query analysis
    # ------------------------------------------------------------
    analysis_payload = {
        "scenario_id": scenario_id,
        "question": "What is driving the next 24h airport stress?",
        "decision_output": decision,
        "intelligence_brief": brief,
        "simulation_response": simulation,
    }

    analysis_response = client.post("/api/v1/analysis/query", json=analysis_payload)
    assert analysis_response.status_code == 200, analysis_response.text

    analysis = analysis_response.json()
    assert analysis["scenario_id"] == scenario_id
    assert analysis["answer"]
    assert len(analysis["top_drivers"]) >= 1
    assert len(analysis["top_entities"]) >= 1
    assert len(analysis["counterfactuals"]) >= 1
    assert 0.0 <= analysis["confidence"] <= 1.0


def test_health_endpoint() -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_analysis_forecast_question_api() -> None:
    payload = {
        "scenario_id": "scn_test_001",
        "question": "What happens next in the next 24 hours?",
        "decision_output": {
            "primary_driver": "Airspace restriction and reroute amplification",
            "critical_window": "T0-T1",
            "confidence": 0.78,
        },
        "intelligence_brief": {
            "forecast": {
                "base_case": "Airport stress remains elevated for 24h.",
                "pessimistic_case": "Escalating cancellations and cargo delay.",
                "controlled_response_case": "Improvement under transparent communication.",
            }
        },
        "simulation_response": {
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
    }

    response = client.post("/api/v1/analysis/query", json=payload)
    assert response.status_code == 200, response.text

    body = response.json()
    assert "Base case" in body["answer"] or "base case" in body["answer"].lower()
    assert body["confidence"] > 0
