import pytest
from fastapi.testclient import TestClient
from app.main import app


client = TestClient(app)


def test_health_check():
    """Test health check endpoint."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["version"] == "1.0.0"


def test_scenario_parse():
    """Test scenario parsing endpoint."""
    payload = {
        "raw_text": "A sudden increase in fuel prices affects the nation",
        "title": "Fuel Price Crisis",
        "language": "auto",
    }
    response = client.post("/api/scenario/parse", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "id" in data
    assert data["title"] == "Fuel Price Crisis"
    assert data["language"] in ["en", "ar"]
    assert "entities" in data


def test_graph_build():
    """Test graph building endpoint."""
    payload = {
        "scenario_id": "test_scenario_123",
        "entities": [
            {
                "id": "entity_1",
                "name": "Government",
                "type": "organization",
                "weight": 0.9,
            },
            {
                "id": "entity_2",
                "name": "Activists",
                "type": "group",
                "weight": 0.8,
            },
        ],
    }
    response = client.post("/api/graph/build", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["scenario_id"] == "test_scenario_123"
    assert "nodes" in data
    assert "edges" in data


def test_agents_generate():
    """Test agent generation endpoint."""
    payload = {
        "scenario_id": "test_scenario_123",
    }
    response = client.post("/api/agents/generate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["scenario_id"] == "test_scenario_123"
    assert "agents" in data
    assert len(data["agents"]) > 0


def test_simulation_run():
    """Test simulation run endpoint."""
    payload = {
        "scenario_id": "test_scenario_123",
    }
    response = client.post("/api/simulation/run", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["scenario_id"] == "test_scenario_123"
    assert "steps" in data
    assert "report" in data
    assert len(data["steps"]) > 0


def test_chat_ask():
    """Test chat endpoint."""
    payload = {
        "question": "Why did this scenario happen?",
        "scenario_id": "test_scenario_123",
    }
    response = client.post("/api/chat/ask", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "answer" in data
    assert "sources" in data
    assert "confidence" in data
