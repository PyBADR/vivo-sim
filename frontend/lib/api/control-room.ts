import { apiRequest } from "./client";
import type { NormalizeResponse } from "../types/scenario";
import type { SignalsResponse } from "../types/signals";
import type { GraphBuildResponse, GraphEnrichResponse } from "../types/graph";
import type { BranchedSimulationResponse } from "../types/simulation";
import type { BranchedDecisionResponse, BranchedBriefResponse, BranchedAnalysisResponse } from "../types/decision";

export async function normalizeScenario(payload: { scenario_text: string }) {
  // Backend expects `raw_text`, frontend uses `scenario_text`
  return apiRequest<NormalizeResponse>("/api/v1/scenario/normalize", {
    method: "POST",
    body: JSON.stringify({ raw_text: payload.scenario_text }),
  });
}

export async function extractSignals(payload: unknown) {
  return apiRequest<SignalsResponse>("/api/v1/signals/extract", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function buildGraph(payload: unknown) {
  return apiRequest<GraphBuildResponse>("/api/v1/graph/build", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function enrichGraph(payload: unknown) {
  return apiRequest<GraphEnrichResponse>("/api/v1/graph/enrich", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function runBranchedSimulation(payload: unknown) {
  return apiRequest<BranchedSimulationResponse>("/api/v1/simulate/run-branched", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function computeBranchedDecision(payload: unknown) {
  return apiRequest<BranchedDecisionResponse>("/api/v1/decision/compute-branched", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function generateBranchedBrief(payload: unknown) {
  return apiRequest<BranchedBriefResponse>("/api/v1/brief/generate-branched", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function queryBranchedAnalysis(payload: unknown) {
  return apiRequest<BranchedAnalysisResponse>("/api/v1/analysis/query-branched", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
