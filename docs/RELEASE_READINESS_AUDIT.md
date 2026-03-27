# VIVO SIM — Release Readiness Audit

**Date**: 2026-03-27
**Auditor**: Senior Release Engineer / QA Lead
**System**: VIVO SIM Control Room + Phase 2D Pipeline
**Scope**: Internal Demo · Private Pilot · Enterprise Client Demo

---

## 1. EXECUTIVE VERDICT

| Target | Verdict | Rationale |
|--------|---------|-----------|
| **Internal Demo** | **NOT READY** | Payload schema mismatch between frontend and backend will cause 422 errors at simulation stage. Pipeline breaks at step 5/8. |
| **Private Pilot** | **NOT READY** | Zero v2 test coverage. Schema mismatch. No containerization. Cannot guarantee stability. |
| **Client Demo** | **NOT READY** | All pilot blockers plus: no predefined demo flow, CORS wildcard, no staging environment, TypeScript errors in build. |

---

## 2. SCORECARD

| Area | Score (0–10) | Detail |
|------|-------------|--------|
| **Contract Freeze** | 4/10 | Routes aligned, but payload schemas mismatch between frontend and backend |
| **API Tests** | 1/10 | Zero v2 test coverage. 35 v1 tests pass, 6 legacy tests fail (pre-existing). |
| **Frontend Smoke** | 5/10 | Components well-structured with null/error handling. But TypeScript errors block clean build. Pipeline will fail at simulation due to schema mismatch. |
| **Demo Pack** | 3/10 | 3 seed scenarios exist but are raw JSON. No preloaded demo flow. No verified end-to-end scenario. |
| **Deploy** | 3/10 | No Docker, no CI/CD, CORS wildcard, no staging URL. Health check works. Backend starts cleanly. |

**Overall: 3.2 / 10**

---

## 3. CRITICAL BLOCKERS (must fix before any demo)

### BLOCKER-1: Frontend → Backend Payload Schema Mismatch (CRITICAL)

**What**: The frontend `useControlRoom` hook sends payloads shaped differently than what the backend expects.

| Stage | Frontend sends | Backend expects | Status |
|-------|---------------|-----------------|--------|
| Simulation (`/simulate/run-branched`) | `{ normalized_state, signals, graph }` | `SimulationRunRequest { scenario_id, normalized_scenario, signals, nodes, edges, strategy }` | **MISMATCH** |
| Decision (`/decision/compute-branched`) | `{ normalized_state, signals, graph, simulation }` | `BranchedDecisionRequest { scenario_id, simulation_response, branch_envelope?, intervention_set?, uncertainty_envelope? }` | **MISMATCH** |
| Brief (`/brief/generate-branched`) | `{ normalized_state, signals, graph, simulation, decision }` | `BranchedBriefRequest { scenario_id, decision_output, simulation_response, signals, branch_envelope?, ... }` | **MISMATCH** |
| Analysis (`/analysis/query-branched`) | `{ question, normalized_state, signals, graph, simulation, decision, brief }` | `BranchedAnalysisRequest { scenario_id, question, decision_output, intelligence_brief, simulation_response, ... }` | **MISMATCH** |

**Impact**: Pipeline breaks at step 5 (simulation) with 422 Validation Error. Steps 6-8 never execute. Control Room is non-functional end-to-end.

**Root cause**: Frontend was built from the implementation pack spec which uses generic field names (`normalized_state`, `graph`, `simulation`). Backend uses typed Pydantic schemas with specific field names (`scenario_id`, `normalized_scenario`, `nodes`, `edges`).

**Fix required**: Either adapt the frontend payloads to match backend schemas, or add a backend adapter layer that accepts the frontend shape. Estimated: 2–4 hours.

### BLOCKER-2: Zero V2 Test Coverage (CRITICAL)

**Coverage matrix**:

| Component | Tests | Status |
|-----------|-------|--------|
| HardenedPropagationEngine | 0 | ❌ |
| BranchingEngine | 0 | ❌ |
| UncertaintyEngine | 0 | ❌ |
| InterventionEngine | 0 | ❌ |
| SimulationServiceV2 | 0 | ❌ |
| DecisionServiceV2 | 0 | ❌ |
| BriefServiceV2 | 0 | ❌ |
| AnalysisServiceV2 | 0 | ❌ |
| `/simulate/run-branched` | 0 | ❌ |
| `/decision/compute-branched` | 0 | ❌ |
| `/brief/generate-branched` | 0 | ❌ |
| `/analysis/query-branched` | 0 | ❌ |

**V1 coverage**: 35 tests, all passing. 6 legacy tests fail due to wrong route paths (pre-existing, not v2-related).

**Impact**: No regression safety net. Any fix to BLOCKER-1 could break v2 services without detection.

---

## 4. MEDIUM RISKS

### RISK-1: TypeScript Build Errors (14 errors)

| Error type | Count | Source | Impact |
|------------|-------|--------|--------|
| `framer-motion` missing types | 8 | Legacy pages (not control-room) | Build may fail in strict mode |
| `WorldStatePanel` union type access | 2 | Control Room | `graph_summary` not on `GraphEnrichResponse` |
| `@xyflow/react` export mismatch | 2 | Legacy GraphPanel | Wrong import (`Node`) |
| `next/types` module | 1 | Generated file | Auto-fix on rebuild |
| Implicit `any` | 1 | Legacy GraphPanel | Strict TS violation |

**Control Room specific**: Only 2 errors (WorldStatePanel). Fixable in < 30 min.

### RISK-2: CORS Wildcard

`allow_origins=["*"]` in `main.py`. Acceptable for local dev and internal demo. Must be locked before any pilot with external network exposure.

### RISK-3: No Containerization

No Dockerfile, no docker-compose.yml. Backend must be started manually with `uvicorn`. Frontend with `npm run dev`. Acceptable for internal demo only.

### RISK-4: Intervention Peak Reduction = 0 at T0

Known mathematical behavior. Interventions show zero peak reduction when baseline peak occurs at phase 0. Could confuse demo audience if not explained.

---

## 5. MINOR ISSUES

| Issue | Location | Impact |
|-------|----------|--------|
| `UncertaintyEnvelope` name collision | `common.py` vs `uncertainty.py` | No runtime impact — all v2 imports correct |
| `PropagationState.damping_applied` default 0.15 | `schemas/propagation.py` | Cosmetic — engine may use different value |
| `.env.local` missing in frontend | `frontend/` | Falls back to `localhost:8000` — correct for dev |
| `seeds/agents/`, `seeds/graphs/`, `seeds/simulations/` empty | `seeds/` | No impact on current pipeline |
| 12 npm audit vulnerabilities | `frontend/package.json` | 8 moderate, 3 high, 1 critical — standard for Next.js ecosystem |
| No backend `.env.example` | `backend/` | Documentation gap only |

---

## 6. EXACT NEXT ACTIONS (ordered, max 5)

### ACTION 1: Fix Payload Schema Mismatch (BLOCKER-1)
**Owner**: Frontend or Backend engineer
**Time**: 2–4 hours
**What**: Align frontend `useControlRoom` payloads to match backend Pydantic request schemas. For each of the 4 branched calls:
- `runBranchedSimulation` → send `{ scenario_id, normalized_scenario, signals, nodes, edges }` from enriched graph output
- `computeBranchedDecision` → send `{ scenario_id, simulation_response }` from simulation output
- `generateBranchedBrief` → send `{ scenario_id, decision_output, simulation_response, signals }` from prior outputs
- `queryBranchedAnalysis` → send `{ scenario_id, question, decision_output, intelligence_brief, simulation_response }` from prior outputs
**Alternative**: Add a backend adapter middleware that normalizes frontend-shaped payloads. Higher effort but preserves frontend simplicity.

### ACTION 2: Write V2 Smoke Tests (BLOCKER-2)
**Owner**: Backend engineer
**Time**: 3–4 hours
**What**: Create `tests/test_v2_pipeline.py` with:
- 1 happy path per branched endpoint (4 tests)
- 1 invalid payload per endpoint (4 tests)
- 1 integration test: full pipeline `normalize → signals → graph → enrich → simulate → decide → brief → analysis`
- Branch probability sum validation
**Minimum**: 9 tests. Full suite: ~20 tests.

### ACTION 3: Fix WorldStatePanel TypeScript Error
**Owner**: Frontend engineer
**Time**: 15 minutes
**What**: In `WorldStatePanel.tsx`, add type guard for `graph_summary` access:
```ts
const summary = 'graph_summary' in graph ? graph.graph_summary : undefined;
```

### ACTION 4: Build & Verify End-to-End Demo Scenario
**Owner**: Product/QA
**Time**: 1 hour (after ACTION 1)
**What**: Run one of the 3 seed scenarios (`fuel_price.json`) through the full Control Room pipeline. Verify all 8 stages complete. Screenshot each panel with real data. Document any rendering issues.

### ACTION 5: Add framer-motion Type Declarations
**Owner**: Frontend engineer
**Time**: 10 minutes
**What**: Create `frontend/types/framer-motion.d.ts`:
```ts
declare module 'framer-motion';
```
This clears 8 of 14 TypeScript errors. Allows clean `next build`.

---

## APPENDIX A: Verified Endpoint Inventory

All paths confirmed live via `TestClient`:

| # | Path | Method | Backend Status | Frontend Calls | Match |
|---|------|--------|---------------|----------------|-------|
| 1 | `/health` | GET | 200 ✅ | — | — |
| 2 | `/api/v1/scenario/normalize` | POST | 422 on empty ✅ | ✅ | ✅ |
| 3 | `/api/v1/signals/extract` | POST | 422 on empty ✅ | ✅ | ✅ |
| 4 | `/api/v1/graph/build` | POST | 422 on empty ✅ | ✅ | ✅ |
| 5 | `/api/v1/graph/enrich` | POST | 422 on empty ✅ | ✅ | ✅ |
| 6 | `/api/v1/simulate/run` | POST | 422 on empty ✅ | — | — |
| 7 | `/api/v1/simulate/run-branched` | POST | 422 on empty ✅ | ✅ | **PAYLOAD MISMATCH** |
| 8 | `/api/v1/decision/compute` | POST | 422 on empty ✅ | — | — |
| 9 | `/api/v1/decision/compute-branched` | POST | 422 on empty ✅ | ✅ | **PAYLOAD MISMATCH** |
| 10 | `/api/v1/brief/generate` | POST | 422 on empty ✅ | — | — |
| 11 | `/api/v1/brief/generate-branched` | POST | 422 on empty ✅ | ✅ | **PAYLOAD MISMATCH** |
| 12 | `/api/v1/analysis/query` | POST | 422 on empty ✅ | — | — |
| 13 | `/api/v1/analysis/query-branched` | POST | 422 on empty ✅ | ✅ | **PAYLOAD MISMATCH** |

**Route paths: 100% aligned. Payload shapes: 0% aligned for branched endpoints.**

## APPENDIX B: Demo Scenario Inventory

| Scenario | File | Language | Domain | Verified E2E |
|----------|------|----------|--------|-------------|
| Fuel Price Increase in Saudi Arabia | `fuel_price.json` | Arabic | GCC Energy | ❌ Not verified |
| Viral Hashtag in Kuwait | `kuwait_hashtag.json` | Arabic | GCC Social/Political | ❌ Not verified |
| Telecom Price Increase Across GCC | `telecom_price.json` | Arabic | GCC Telecom | ❌ Not verified |

**Missing**: Infrastructure/undersea/strategic scenario (requested in audit scope). 0 of 3 scenarios verified end-to-end.

## APPENDIX C: Test Results Summary

```
Backend: 43 passed, 6 failed (legacy route paths) — 0 v2 tests exist
Frontend: 14 TypeScript errors (2 in Control Room, 12 in legacy pages)
Integration: Not runnable (schema mismatch blocks pipeline)
```
