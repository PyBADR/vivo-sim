# PASS 1 — Frontend Integration Audit

**Date**: 2026-03-27
**Phase**: Frontend Integration (backend validated, 43/43 tests pass)
**Gate Rule**: No new backend features. No scope widening. Integration only.

---

## 1. Frontend Structure Inventory

### Source Files (excluding node_modules)

```
app/
  layout.tsx            — Root layout, metadata, global CSS
  page.tsx              — Landing / marketing page (NOT the control room)
  architecture/page.tsx — Static architecture documentation page
  demo/page.tsx         — ★ CONTROL ROOM — primary integration target

components/
  graph/GraphPanel.tsx       — React Flow graph visualization
  simulation/TimelinePanel.tsx — 4-step simulation timeline
  report/ReportPanel.tsx     — Intelligence brief display
  chat/ChatPanel.tsx         — Analyst query interface
  ui/Navbar.tsx              — Navigation bar
  ui/Footer.tsx              — Footer
  ui/SectionHeading.tsx      — Reusable heading component

hooks/
  useAnimateOnScroll.ts — DEPRECATED (empty, safe to delete)

lib/
  api.ts        — ★ API client (STALE — targets old routes)
  mock-data.ts  — ★ All mock data (6 exports)
  types.ts      — ★ TypeScript types (STALE — mismatches backend schemas)
  utils.ts      — Utility functions (cn, formatConfidence, getNodeColor, etc.)

features/     — EMPTY directory

styles/
  globals.css   — Tailwind + design system tokens
```

---

## 2. Panel-to-Computational-State Mapping

| # | Panel | Math Object | Location | Current Data Source |
|---|-------|-------------|----------|-------------------|
| 1 | Scenario Input | S = f_norm(x) | demo/page.tsx (left sidebar) | `mockScenarios` hardcoded presets |
| 2 | Signals | Σ = f_sig(S) | **MISSING** — no panel exists | N/A |
| 3 | Entity Graph | G₀, G* | GraphPanel.tsx | `mockGraphNodes`, `mockGraphEdges` |
| 4 | Simulation Timeline | Z(0:T) | TimelinePanel.tsx | `mockSimulationSteps` |
| 5 | Decision Output | D(a) | **MISSING** — no panel exists | N/A |
| 6 | Intelligence Brief | B | ReportPanel.tsx | `mockReport` |
| 7 | Analyst Query | Q(y) | ChatPanel.tsx | `mockResponses` (hardcoded dict) + `mockChatMessages` |

**Critical Gaps**: Panels for **Signals** (Σ) and **Decision Output** (D) do not exist in the frontend. These must be created to complete the mathematical pipeline.

---

## 3. Mock Data Dependency Map

### mock-data.ts Exports → Consumers

| Export | Type | Used In | Mock Fields vs Backend Fields |
|--------|------|---------|------------------------------|
| `mockScenarios` | `Scenario[]` | demo/page.tsx (preset selector, form defaults) | **Mismatch**: frontend `Scenario` has `{id,title,scenario,raw_text,language,country,category}` but backend `NormalizedScenario` has `{scenario_id,title,raw_text,region,domain,trigger,actors,signal_categories,constraints,time_horizon_hours,assumptions,confidence}` |
| `mockGraphNodes` | `GraphNode[]` | demo/page.tsx → GraphPanel | **Mismatch**: frontend `{id,position,data:{label,type,weight},type}` but backend `GraphNode` has `{id,label,type,region,metadata}` — no `position`, no `weight` in backend |
| `mockGraphEdges` | `GraphEdge[]` | demo/page.tsx → GraphPanel | **Mismatch**: frontend `{id,source,target,label,animated}` but backend `GraphEdge` has `{source,target,type,weight,metadata}` — no `id`, no `label` string |
| `mockSimulationSteps` | `SimulationStep[]` | demo/page.tsx → TimelinePanel | **Mismatch**: frontend `{step,label,summary,sentiment_score,visibility_score,events}` but backend `SimulationPhase` has `{phase,label,airport_stress,shipping_stress,banking_stress,media_stress,public_stress,energy_stress,market_stress,logistics_stress,policy_stress,total_risk_score,key_events}` |
| `mockReport` | `SimulationReport` | demo/page.tsx → ReportPanel | **Mismatch**: frontend `{prediction,main_driver,top_influencers,spread_level,confidence,timeline_summary,graph_observations}` but backend `IntelligenceBrief` has `{scenario_id,scenario_summary,timeline_narrative,key_drivers,entity_influence,forecast,business_impact,recommended_actions,assumptions,confidence}` |
| `mockChatMessages` | `ChatMessage[]` | demo/page.tsx → ChatPanel | Structurally compatible (id, role, content) |

### Inline Hardcoded Mocks (NOT in mock-data.ts)

| Location | Mock | Description |
|----------|------|-------------|
| ChatPanel.tsx:18-23 | `mockResponses` | Keyword-match dict returning canned strings |
| ChatPanel.tsx:12-16 | `presetQueries` | 3 hardcoded suggested queries |
| demo/page.tsx:38-45 | `processingSteps` | 6 labels for the pipeline progress indicator |

---

## 4. API Client Audit (lib/api.ts)

**Current state**: ENTIRELY STALE. Every route path is wrong.

| api.ts Method | Current Path | Correct Backend Path | Status |
|---------------|-------------|---------------------|--------|
| `api.health` | `/api/health` | `/api/v1/health` | ❌ WRONG |
| `api.parseScenario` | `/api/scenario/parse` | `/api/v1/scenario/normalize` | ❌ WRONG (path + verb) |
| `api.buildGraph` | `/api/graph/build` | `/api/v1/graph/build` | ❌ WRONG (path + payload) |
| `api.generateAgents` | `/api/agents/generate` | N/A (agents are generated inside simulation) | ❌ OBSOLETE |
| `api.runSimulation` | `/api/simulation/run` | `/api/v1/simulate/run` | ❌ WRONG |
| `api.askChat` | `/api/chat/ask` | `/api/v1/analysis/query` | ❌ WRONG (path + payload) |
| (missing) | — | `/api/v1/signals/extract` | ❌ NOT IMPLEMENTED |
| (missing) | — | `/api/v1/graph/enrich` | ❌ NOT IMPLEMENTED |
| (missing) | — | `/api/v1/decision/compute` | ❌ NOT IMPLEMENTED |
| (missing) | — | `/api/v1/brief/generate` | ❌ NOT IMPLEMENTED |

**VERDICT**: api.ts must be rewritten from scratch.

---

## 5. State Management Audit (demo/page.tsx)

### Current State Variables

| Variable | Type | Purpose | Integration Impact |
|----------|------|---------|-------------------|
| `selectedScenario` | `Scenario` | Currently selected preset | Replace with user-editable form state |
| `scenarioTitle` | `string` | Editable title | Keep — feeds into `raw_text` |
| `scenarioText` | `string` | Editable scenario body | Keep — this IS `raw_text` |
| `country` | `string` | Country selector | Map to `region_hint` |
| `category` | `string` | Category selector | Map to `domain_hint` |
| `isRunning` | `boolean` | Pipeline processing flag | Keep — drive loading states |
| `hasResults` | `boolean` | Results available flag | Keep — gate panel rendering |
| `currentStep` | `number` | Timeline active step | Keep — TimelinePanel interaction |
| `processingStep` | `number` | Pipeline progress step | Keep — animate real pipeline stages |
| `runId` | `string` | Simulation run ID | Replace with `scenario_id` from backend |
| `runTimestamp` | `string` | Run timestamp | Keep — set from response |

### Missing State (required for live integration)

| State | Type | Purpose |
|-------|------|---------|
| `normalizedScenario` | `NormalizedScenario | null` | Store S = f_norm(x) response |
| `signals` | `SignalExtractionResponse | null` | Store Σ = f_sig(S) response |
| `graphData` | `GraphBuildResponse | null` | Store G₀ response |
| `enrichedGraph` | `GraphEnrichResponse | null` | Store G* response |
| `simulationResult` | `SimulationRunResponse | null` | Store Z(0:T) response |
| `decisionOutput` | `DecisionOutput | null` | Store D(a) response |
| `intelligenceBrief` | `IntelligenceBrief | null` | Store B response |
| `pipelineError` | `{stage: string, message: string} | null` | Error state per stage |

---

## 6. Endpoint-to-Panel Integration Map (Mathematical Order)

### Pipeline Execution Sequence

```
USER INPUT (x)
  ↓
STEP A: POST /api/v1/scenario/normalize
  Request:  { raw_text, region_hint?, domain_hint?, preferred_horizon? }
  Response: NormalizedScenario { scenario_id, title, region, domain, trigger, actors, ... }
  State:    normalizedScenario = response
  Panel:    Left sidebar updates with computed metadata
  ↓
STEP B: POST /api/v1/signals/extract
  Request:  { scenario_id }
  Response: SignalExtractionResponse { scenario_id, signals[], extracted_count, confidence }
  State:    signals = response
  Panel:    NEW Signals panel renders evidence field
  ↓
STEP C: POST /api/v1/graph/build
  Request:  { scenario_id, normalized_scenario: dict, signals: dict[] }
  Response: GraphBuildResponse { scenario_id, nodes[], edges[], confidence }
  State:    graphData = response
  Panel:    GraphPanel renders (after position layout transform)
  ↓
STEP D: POST /api/v1/graph/enrich
  Request:  { scenario_id, nodes[], edges[], signals: dict[] }
  Response: GraphEnrichResponse { scenario_id, nodes[] (enriched), edges[] }
  State:    enrichedGraph = response
  Panel:    GraphPanel updates with influence/trust scores
  ↓
STEP E: POST /api/v1/simulate/run
  Request:  { scenario_id, normalized_scenario, signals[], nodes[], edges[], agent_profiles[] }
  Response: SimulationRunResponse { scenario_id, phases[], airport_states[], sector_states[], market_state, spread_velocity, critical_window, confidence }
  State:    simulationResult = response
  Panel:    TimelinePanel renders phases
  ↓
STEP F: POST /api/v1/decision/compute
  Request:  { scenario_id, simulation_response: dict }
  Response: DecisionOutput { scenario_id, risk_level, risk_score, spread_velocity, primary_driver, critical_window, financial_impact, customer_impact, ... }
  State:    decisionOutput = response
  Panel:    NEW Decision panel renders scored action surface
  ↓
STEP G: POST /api/v1/brief/generate
  Request:  { scenario_id, decision_output: dict, simulation_response: dict, signals: dict[] }
  Response: IntelligenceBrief { scenario_id, scenario_summary, timeline_narrative, key_drivers, entity_influence, forecast, business_impact, recommended_actions, assumptions, confidence }
  State:    intelligenceBrief = response
  Panel:    ReportPanel renders (adapted to new schema)
  ↓
STEP H (on demand): POST /api/v1/analysis/query
  Request:  { scenario_id, question, decision_output: dict, intelligence_brief: dict, simulation_response: dict }
  Response: AnalysisQueryResponse { scenario_id, answer, top_drivers[], top_entities[], counterfactuals[], confidence }
  Panel:    ChatPanel renders response
```

---

## 7. TypeScript Contract Definitions (Required)

### New file: `lib/contracts.ts`

Must define typed interfaces for ALL request/response pairs that mirror backend Pydantic schemas exactly. The current `lib/types.ts` is stale and must be replaced.

Key contracts needed:

1. `ScenarioNormalizeRequest` / `NormalizedScenario`
2. `SignalExtractionRequest` / `SignalExtractionResponse` + `Signal`
3. `GraphBuildRequest` / `GraphBuildResponse` + `GraphNode`, `GraphEdge`
4. `GraphEnrichRequest` / `GraphEnrichResponse` + `EnrichedGraphNode`
5. `SimulationRunRequest` / `SimulationRunResponse` + `SimulationPhase`, `AirportState`, `SectorState`, `MarketState`
6. `DecisionComputeRequest` / `DecisionOutput` + `CustomerImpact`, `MoneyRange`
7. `BriefGenerateRequest` / `IntelligenceBrief` + `ForecastBlock`, `BusinessImpactBlock`
8. `AnalysisQueryRequest` / `AnalysisQueryResponse`

Plus all enums: `Region`, `Domain`, `TriggerType`, `SignalKind`, `SignalCategory`, `EntityType`, `EdgeType`, `Stance`, `PhaseLabel`, `RiskLevel`, `StrategyType`, `Horizon`, `ConstraintType`, `EmotionalState`

---

## 8. File-by-File Implementation Plan

### Phase 1: Foundation (no UI changes)

| # | File | Action | Purpose |
|---|------|--------|---------|
| 1 | `lib/contracts.ts` | **CREATE** | All TypeScript request/response types matching backend schemas |
| 2 | `lib/api.ts` | **REWRITE** | New API client with correct routes, typed methods, error handling, timeout |
| 3 | `lib/types.ts` | **KEEP** (legacy alias) | Re-export from contracts.ts for backward compat, deprecation comments |
| 4 | `lib/mock-data.ts` | **RENAME** → `lib/fixtures.ts` | Keep as dev fallback only, not imported in runtime path |
| 5 | `lib/transforms.ts` | **CREATE** | Backend→frontend data transforms (e.g. graph layout positioning, phase→step mapping) |

### Phase 2: Pipeline Orchestrator

| # | File | Action | Purpose |
|---|------|--------|---------|
| 6 | `hooks/useSimulationPipeline.ts` | **CREATE** | Orchestrates A→G pipeline in dependency order, manages all 8 state objects, exposes loading/error/data per stage |

### Phase 3: Panel Integration (mathematical order)

| # | File | Action | Purpose |
|---|------|--------|---------|
| 7 | `app/demo/page.tsx` | **REWRITE** | Replace mock imports with pipeline hook, wire all panels to live state |
| 8 | `components/signals/SignalsPanel.tsx` | **CREATE** | New panel for Σ (signal evidence field) |
| 9 | `components/graph/GraphPanel.tsx` | **MODIFY** | Accept backend GraphNode/Edge types, add layout transform |
| 10 | `components/simulation/TimelinePanel.tsx` | **MODIFY** | Accept SimulationPhase[] instead of SimStep[], render stress metrics |
| 11 | `components/decision/DecisionPanel.tsx` | **CREATE** | New panel for D(a) (risk level, financial impact, recommended actions) |
| 12 | `components/report/ReportPanel.tsx` | **MODIFY** | Accept IntelligenceBrief type, render forecast/business impact blocks |
| 13 | `components/chat/ChatPanel.tsx` | **MODIFY** | Replace mockResponses with live /analysis/query calls |

### Phase 4: Configuration

| # | File | Action | Purpose |
|---|------|--------|---------|
| 14 | `next.config.js` | **MODIFY** | Add API rewrites/proxy for dev (localhost:8000 → /api/v1/*) |
| 15 | `.env.local` | **CREATE** | `NEXT_PUBLIC_API_URL=http://localhost:8000` |

---

## 9. Risks and Gaps

| Risk | Severity | Mitigation |
|------|----------|------------|
| Backend graph nodes have no `position` — React Flow requires x,y | HIGH | Create force-directed or circular layout algorithm in `transforms.ts` |
| Backend SimulationPhase is stress-based (9 sectors), frontend expects sentiment/visibility | HIGH | Map `total_risk_score` to visibility, derive sentiment from composite stress |
| Backend IntelligenceBrief has forecast/business_impact blocks — frontend expects flat report | MEDIUM | Adapt ReportPanel to render nested structure |
| No CORS configuration on FastAPI for frontend dev | MEDIUM | Add `next.config.js` rewrites or FastAPI CORS middleware |
| Backend `signals/extract` requires `raw_sources[]` but may not have real sources | LOW | Pass empty array — service generates baseline signals |
| Two NEW panels (Signals, Decision) needed — design must match existing system aesthetic | MEDIUM | Clone panel header pattern from existing components |

---

## 10. Decision Gate

Before proceeding to PASS 2 (code changes), the following must be true:

- [x] All frontend files audited
- [x] All mock dependencies identified
- [x] All backend payload shapes inspected
- [x] Mathematical pipeline mapped to panels
- [x] TypeScript contracts specified
- [x] File-by-file plan produced
- [x] Missing panels identified (Signals, Decision)
- [x] Data transform gaps identified (graph layout, phase mapping)
- [x] API client gap identified (complete rewrite needed)

**GATE STATUS: PASS** — Ready for PASS 2 execution.
