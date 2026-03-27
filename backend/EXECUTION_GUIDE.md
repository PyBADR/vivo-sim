# Deevo Sim Backend — Execution Guide

## What This Is

Production-grade GCC Shock Intelligence simulation backend. Deterministic engines + weighted graph propagation + phase-based simulation + enterprise decision output.

Full reasoning chain: **scenario → signals → graph → agents → simulation → decision → brief → analysis**

---

## Project Structure

```
backend/
├── pyproject.toml              # Project config + pytest settings
├── conftest.py                 # Pytest root path config
├── app/
│   ├── main.py                 # FastAPI entry point
│   ├── schemas/                # Pydantic v2 data contracts
│   │   ├── common.py           # DeevoBaseModel, enums, mixins
│   │   ├── scenario.py         # ScenarioNormalizeRequest, NormalizedScenario
│   │   ├── signal.py           # Signal, RawSource, extraction types
│   │   ├── graph.py            # GraphNode, GraphEdge, enrichment types
│   │   ├── agent.py            # AgentProfile types
│   │   ├── simulation.py       # SimulationPhase, AirportState, MarketState, SectorState
│   │   ├── decision.py         # DecisionOutput, CustomerImpact, MoneyRange
│   │   ├── brief.py            # IntelligenceBrief, ForecastBlock, BusinessImpactBlock
│   │   ├── analysis.py         # AnalysisQueryRequest/Response
│   │   └── __init__.py         # Barrel exports
│   ├── engines/                # Mathematical core (no FastAPI dependency)
│   │   ├── propagation_engine.py   # Weighted graph propagation
│   │   ├── airport_engine.py       # Airport composite risk scoring
│   │   ├── market_engine.py        # Market stress scoring
│   │   ├── sector_engine.py        # Sector spillover model
│   │   ├── confidence_engine.py    # Confidence scoring
│   │   ├── strategy_engine.py      # Strategy ranking
│   │   ├── risk_engine.py          # 9-dimensional risk aggregation
│   │   └── __init__.py
│   ├── services/               # Business logic layer
│   │   ├── scenario_service.py     # Step 1: normalize raw text
│   │   ├── signal_service.py       # Step 2: extract signals
│   │   ├── graph_service.py        # Step 3: build + enrich graph
│   │   ├── agent_service.py        # Step 4: generate agent profiles
│   │   ├── simulation_service.py   # Step 5: run 6-phase simulation
│   │   ├── decision_service.py     # Step 6: compute decision output
│   │   ├── brief_service.py        # Step 7: generate intelligence brief
│   │   ├── analysis_service.py     # Step 8: answer analyst queries
│   │   └── __init__.py
│   └── api/                    # FastAPI route layer
│       ├── deps.py                 # @lru_cache service singletons
│       ├── router.py               # /api/v1 prefix aggregator
│       └── routes/
│           ├── scenario.py         # POST /api/v1/scenario/normalize
│           ├── signals.py          # POST /api/v1/signals/extract
│           ├── graph.py            # POST /api/v1/graph/build + /enrich
│           ├── simulate.py         # POST /api/v1/simulate/run
│           ├── decision.py         # POST /api/v1/decision/compute
│           ├── brief.py            # POST /api/v1/brief/generate
│           ├── analysis.py         # POST /api/v1/analysis/query
│           └── __init__.py
└── tests/
    ├── __init__.py
    ├── test_engines.py         # Engine math validation (32 tests)
    ├── test_end_to_end_flow.py # Service-level integration (2 tests)
    └── test_api_flow.py        # HTTP endpoint validation (3 tests)
```

---

## Setup

```bash
cd backend

# Create venv
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install fastapi pydantic uvicorn httpx pytest

# Verify imports
python -c "from app.schemas import *; print('Schemas OK')"
python -c "from app.engines import *; print('Engines OK')"
python -c "from app.services import *; print('Services OK')"
python -c "from app.main import app; print('App OK')"
```

---

## Run Tests

### Level 1: Engine Math Tests
Validates the mathematical core independently from FastAPI, services, schemas.

```bash
pytest tests/test_engines.py -v
```

Expected: 32+ tests pass. Covers propagation, airport, market, sector, confidence, strategy, risk engines.

### Level 2: Service Integration Tests
Validates the full reasoning chain at service level.

```bash
pytest tests/test_end_to_end_flow.py -v
```

Expected: 2 tests pass. Full vertical slice + forecast question routing.

### Level 3: API Endpoint Tests
Validates HTTP endpoints, schema parsing, response serialization.

```bash
pytest tests/test_api_flow.py -v
```

Expected: 3 tests pass. Full API flow + health endpoint + analysis question routing.

### All Tests
```bash
pytest tests/ -v
```

---

## Run Server

```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

Health check: `GET http://localhost:8000/health`

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/v1/scenario/normalize | Normalize raw scenario text |
| POST | /api/v1/signals/extract | Extract typed signals from sources |
| POST | /api/v1/graph/build | Build entity relationship graph |
| POST | /api/v1/graph/enrich | Enrich graph with influence scores |
| POST | /api/v1/simulate/run | Run 6-phase simulation |
| POST | /api/v1/decision/compute | Compute enterprise decision output |
| POST | /api/v1/brief/generate | Generate intelligence brief |
| POST | /api/v1/analysis/query | Answer analyst questions |

---

## Pipeline Flow

```
1. ScenarioService.normalize()
   Input:  raw text + hints
   Output: NormalizedScenario (trigger, region, domain, constraints)

2. SignalService.extract()
   Input:  scenario_id + raw sources
   Output: List[Signal] with category, velocity, confidence

3. GraphService.build()
   Input:  normalized scenario + signals
   Output: nodes + edges (airports, sectors, dependencies)

4. GraphService.enrich()
   Input:  graph nodes + edges + signals
   Output: enriched nodes with influence, trust, propagation scores

5. SimulationService.run()
   Input:  scenario + graph + agent profiles + strategy
   Output: 6 phases (T0-T5) with 9 stress dimensions + airport/market/sector states

6. DecisionService.compute()
   Input:  simulation response
   Output: risk level, financial impact, customer impact, strategy rankings

7. BriefService.generate()
   Input:  decision output + simulation response
   Output: executive brief with forecast, business impact, recommendations

8. AnalysisService.answer()
   Input:  question + all context
   Output: structured answer with drivers, entities, counterfactuals
```

---

## Engine Mathematical Specifications

### Propagation Engine
```
delta_x = source_activation * edge_weight * channel_boost * emotion_boost * time_decay * constraint_multiplier
next_value = current_value + sum(incoming_deltas) - stabilization_effect
All values clamped to [0, 1]
```

### Airport Engine
```
AirportStress = 0.30*airspace + 0.20*reroute + 0.20*cancellation + 0.15*cargo + 0.15*passenger
```

### Market Engine
```
MarketStress = 0.30*oil + 0.15*gold + 0.20*fx + 0.10*crypto + 0.25*shipping
```

### Sector Engine
```
SectorImpact = direct_impact + sum(upstream_i * weight_i)
```

### Confidence Engine
```
Confidence = 0.35*reliability + 0.25*coverage + 0.25*consistency - 0.15*uncertainty
```

### Strategy Engine
```
StrategyScore = 0.40*risk_reduction + 0.25*trust_gain - 0.20*revenue_penalty - 0.15*regulatory_penalty
```

### Risk Engine
```
TotalRisk = 0.15*airport + 0.10*shipping + 0.10*banking + 0.10*media + 0.10*public + 0.10*energy + 0.10*market + 0.15*logistics + 0.10*policy
```

---

## Definition of Done

1. All 3 test files pass with zero failures
2. All engine math is deterministic and clamped to [0, 1]
3. Full pipeline produces valid output for any GCC scenario text
4. No hardcoded responses — all outputs are computed from simulation state
5. All Pydantic schemas validate with `extra="forbid"`
6. Server starts and all endpoints return 200 for valid payloads
