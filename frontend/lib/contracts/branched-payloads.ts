/**
 * Contract builders for branched pipeline payloads.
 *
 * These functions guarantee the frontend sends payloads that match
 * the backend Pydantic request schemas EXACTLY.
 *
 * Backend schemas (source of truth):
 *   SimulationRunRequest       → /api/v1/simulate/run-branched
 *   BranchedDecisionRequest    → /api/v1/decision/compute-branched
 *   BranchedBriefRequest       → /api/v1/brief/generate-branched
 *   BranchedAnalysisRequest    → /api/v1/analysis/query-branched
 */

import type { NormalizeResponse } from "@/lib/types/scenario";
import type { SignalsResponse } from "@/lib/types/signals";
import type { GraphEnrichResponse } from "@/lib/types/graph";

/* ── Payload interfaces (match backend Pydantic exactly) ───── */

/** Matches backend SimulationRunRequest */
export interface SimulationRunBranchedPayload {
  scenario_id: string;
  normalized_scenario: Record<string, unknown>;
  signals: Record<string, unknown>[];
  nodes: Record<string, unknown>[];
  edges: Record<string, unknown>[];
  agent_profiles?: Record<string, unknown>[];
  strategy?: string;
}

/** Matches backend BranchedDecisionRequest */
export interface DecisionComputeBranchedPayload {
  scenario_id: string;
  simulation_response: Record<string, unknown>;
  branch_envelope?: Record<string, unknown> | null;
  intervention_set?: Record<string, unknown> | null;
  uncertainty_envelope?: Record<string, unknown> | null;
}

/** Matches backend BranchedBriefRequest */
export interface BriefGenerateBranchedPayload {
  scenario_id: string;
  decision_output: Record<string, unknown>;
  simulation_response: Record<string, unknown>;
  signals: Record<string, unknown>[];
  branch_envelope?: Record<string, unknown> | null;
  intervention_set?: Record<string, unknown> | null;
  uncertainty_envelope?: Record<string, unknown> | null;
}

/** Matches backend BranchedAnalysisRequest */
export interface AnalysisQueryBranchedPayload {
  scenario_id: string;
  question: string;
  decision_output: Record<string, unknown>;
  intelligence_brief: Record<string, unknown>;
  simulation_response: Record<string, unknown>;
  branch_envelope?: Record<string, unknown> | null;
  intervention_set?: Record<string, unknown> | null;
  uncertainty_envelope?: Record<string, unknown> | null;
}

/* ── Validation helper ─────────────────────────────────────── */

function assertDefined<T>(value: T | null | undefined, name: string): T {
  if (value === null || value === undefined) {
    throw new Error(`Contract error: ${name} is required`);
  }
  return value;
}

function assertNonEmptyString(value: unknown, name: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Contract error: ${name} must be a non-empty string`);
  }
  return value;
}

function assertArray(value: unknown, name: string): unknown[] {
  if (!Array.isArray(value)) {
    throw new Error(`Contract error: ${name} must be an array`);
  }
  return value;
}

/* ── Builder: Simulation ───────────────────────────────────── */

export function buildSimulationPayload(args: {
  scenarioId: string;
  normalize: NormalizeResponse;
  signals: SignalsResponse;
  enrichment: GraphEnrichResponse;
}): SimulationRunBranchedPayload {
  const { scenarioId, normalize, signals, enrichment } = args;

  assertNonEmptyString(scenarioId, "scenario_id");
  assertDefined(normalize, "normalize");
  assertDefined(signals, "signals");
  assertArray(enrichment?.nodes, "nodes");
  assertArray(enrichment?.edges, "edges");

  return {
    scenario_id: scenarioId,
    normalized_scenario: normalize as unknown as Record<string, unknown>,
    signals: (signals.signals ?? []) as unknown as Record<string, unknown>[],
    nodes: enrichment.nodes as unknown as Record<string, unknown>[],
    edges: enrichment.edges as unknown as Record<string, unknown>[],
  };
}

/* ── Builder: Decision ─────────────────────────────────────── */

export function buildDecisionPayload(args: {
  scenarioId: string;
  simulationRaw: Record<string, unknown>;
}): DecisionComputeBranchedPayload {
  const { scenarioId, simulationRaw } = args;

  assertNonEmptyString(scenarioId, "scenario_id");
  assertDefined(simulationRaw, "simulation_response");

  return {
    scenario_id: scenarioId,
    simulation_response: simulationRaw.baseline_response as Record<string, unknown> ?? simulationRaw,
    branch_envelope: simulationRaw.branch_envelope as Record<string, unknown> ?? null,
    intervention_set: simulationRaw.intervention_set as Record<string, unknown> ?? null,
    uncertainty_envelope: simulationRaw.uncertainty_envelope as Record<string, unknown> ?? null,
  };
}

/* ── Builder: Brief ────────────────────────────────────────── */

export function buildBriefPayload(args: {
  scenarioId: string;
  signals: SignalsResponse;
  simulationRaw: Record<string, unknown>;
  decisionRaw: Record<string, unknown>;
}): BriefGenerateBranchedPayload {
  const { scenarioId, signals, simulationRaw, decisionRaw } = args;

  assertNonEmptyString(scenarioId, "scenario_id");
  assertDefined(simulationRaw, "simulation_response");
  assertDefined(decisionRaw, "decision_output");

  return {
    scenario_id: scenarioId,
    decision_output: decisionRaw.decision_output as Record<string, unknown> ?? decisionRaw,
    simulation_response: simulationRaw.baseline_response as Record<string, unknown> ?? simulationRaw,
    signals: (signals.signals ?? []) as unknown as Record<string, unknown>[],
    branch_envelope: simulationRaw.branch_envelope as Record<string, unknown> ?? null,
    intervention_set: simulationRaw.intervention_set as Record<string, unknown> ?? null,
    uncertainty_envelope: simulationRaw.uncertainty_envelope as Record<string, unknown> ?? null,
  };
}

/* ── Builder: Analysis ─────────────────────────────────────── */

export function buildAnalysisPayload(args: {
  scenarioId: string;
  question: string;
  simulationRaw: Record<string, unknown>;
  decisionRaw: Record<string, unknown>;
  briefRaw: Record<string, unknown>;
}): AnalysisQueryBranchedPayload {
  const { scenarioId, question, simulationRaw, decisionRaw, briefRaw } = args;

  assertNonEmptyString(scenarioId, "scenario_id");
  assertNonEmptyString(question, "question");
  assertDefined(simulationRaw, "simulation_response");
  assertDefined(decisionRaw, "decision_output");
  assertDefined(briefRaw, "intelligence_brief");

  return {
    scenario_id: scenarioId,
    question,
    decision_output: decisionRaw.decision_output as Record<string, unknown> ?? decisionRaw,
    intelligence_brief: briefRaw.brief as Record<string, unknown> ?? briefRaw,
    simulation_response: simulationRaw.baseline_response as Record<string, unknown> ?? simulationRaw,
    branch_envelope: simulationRaw.branch_envelope as Record<string, unknown> ?? null,
    intervention_set: simulationRaw.intervention_set as Record<string, unknown> ?? null,
    uncertainty_envelope: simulationRaw.uncertainty_envelope as Record<string, unknown> ?? null,
  };
}
