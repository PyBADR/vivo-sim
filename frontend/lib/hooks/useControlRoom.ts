"use client";

import { useMemo, useState, useCallback } from "react";
import {
  normalizeScenario,
  extractSignals,
  buildGraph,
  enrichGraph,
  runBranchedSimulation,
  computeBranchedDecision,
  generateBranchedBrief,
  queryBranchedAnalysis,
} from "../api/control-room";
import {
  buildSimulationPayload,
  buildDecisionPayload,
  buildBriefPayload,
  buildAnalysisPayload,
} from "../contracts/branched-payloads";
import {
  adaptSimulationResponse,
  adaptDecisionResponse,
  adaptBriefResponse,
  adaptAnalysisResponse,
} from "../contracts/response-adapters";
import type { StageStatus, StageKey } from "../types/control-room";
import type { NormalizeResponse } from "../types/scenario";
import type { SignalsResponse } from "../types/signals";
import type { GraphBuildResponse, GraphEnrichResponse } from "../types/graph";
import type { BranchedSimulationResponse } from "../types/simulation";
import type {
  BranchedDecisionResponse,
  BranchedBriefResponse,
  BranchedAnalysisResponse,
} from "../types/decision";

/* ── State shape ─────────────────────────────────────── */
export interface ControlRoomState {
  scenarioInput: string;
  statuses: StageStatus[];
  normalize: NormalizeResponse | null;
  signals: SignalsResponse | null;
  graph: GraphBuildResponse | null;
  enrichment: GraphEnrichResponse | null;
  simulation: BranchedSimulationResponse | null;
  decision: BranchedDecisionResponse | null;
  brief: BranchedBriefResponse | null;
  analysis: BranchedAnalysisResponse | null;
  selectedBranchId: string | null;
  selectedInterventionId: string | null;
  isRunning: boolean;
  error: string | null;
}

const initialStatuses: StageStatus[] = [
  { key: "scenario", label: "Scenario", state: "idle" },
  { key: "signals", label: "Signals", state: "idle" },
  { key: "graph", label: "Graph", state: "idle" },
  { key: "enrichment", label: "Enrichment", state: "idle" },
  { key: "simulation", label: "Simulation", state: "idle" },
  { key: "decision", label: "Decision", state: "idle" },
  { key: "brief", label: "Brief", state: "idle" },
  { key: "analysis", label: "Analysis", state: "idle" },
];

const initialState: ControlRoomState = {
  scenarioInput: "",
  statuses: initialStatuses,
  normalize: null,
  signals: null,
  graph: null,
  enrichment: null,
  simulation: null,
  decision: null,
  brief: null,
  analysis: null,
  selectedBranchId: null,
  selectedInterventionId: null,
  isRunning: false,
  error: null,
};

/* ── Hook ────────────────────────────────────────────── */
export function useControlRoom() {
  const [state, setState] = useState<ControlRoomState>(initialState);

  const setStage = useCallback(
    (key: StageKey, patch: Partial<StageStatus>) => {
      setState((prev) => ({
        ...prev,
        statuses: prev.statuses.map((s) =>
          s.key === key ? { ...s, ...patch } : s
        ),
      }));
    },
    []
  );

  const resetDownstream = useCallback(() => {
    setState((prev) => ({
      ...prev,
      normalize: null,
      signals: null,
      graph: null,
      enrichment: null,
      simulation: null,
      decision: null,
      brief: null,
      analysis: null,
      selectedBranchId: null,
      selectedInterventionId: null,
      error: null,
      statuses: initialStatuses,
    }));
  }, []);

  /* ── Main pipeline ─────────────────────────────────── */
  const runPipeline = useCallback(
    async (scenarioText: string) => {
      resetDownstream();
      setState((prev) => ({
        ...prev,
        scenarioInput: scenarioText,
        isRunning: true,
      }));

      try {
        /* 1 — Normalize (backend: ScenarioNormalizeRequest → NormalizedScenario) */
        setStage("scenario", { state: "loading", message: "Normalizing scenario…" });
        const normalize = await normalizeScenario({ scenario_text: scenarioText });
        setState((prev) => ({ ...prev, normalize }));
        setStage("scenario", { state: "ready", message: "Scenario normalized" });

        /* ── scenario_id from normalize flows through all stages ── */
        const scenarioId = normalize.scenario_id;

        /* 2 — Signals (backend: SignalExtractionRequest → SignalExtractionResponse) */
        setStage("signals", { state: "loading", message: "Extracting signals…" });
        const signals = await extractSignals({
          scenario_id: scenarioId,
          raw_sources: [],
        });
        setState((prev) => ({ ...prev, signals }));
        setStage("signals", { state: "ready", message: `${signals.extracted_count} signals extracted` });

        /* 3 — Graph build (backend: GraphBuildRequest → GraphBuildResponse) */
        setStage("graph", { state: "loading", message: "Building graph…" });
        const graph = await buildGraph({
          scenario_id: scenarioId,
          normalized_scenario: normalize,
          signals: signals.signals,
        });
        setState((prev) => ({ ...prev, graph }));
        setStage("graph", { state: "ready", message: `${graph.nodes.length} nodes, ${graph.edges.length} edges` });

        /* 4 — Graph enrich (backend: GraphEnrichRequest → GraphEnrichResponse) */
        setStage("enrichment", { state: "loading", message: "Enriching graph…" });
        const enrichment = await enrichGraph({
          scenario_id: scenarioId,
          nodes: graph.nodes,
          edges: graph.edges,
          signals: signals.signals,
        });
        setState((prev) => ({ ...prev, enrichment }));
        setStage("enrichment", { state: "ready", message: "Graph enriched" });

        /* 5 — Branched simulation (backend: SimulationRunRequest → branched dict) */
        setStage("simulation", {
          state: "loading",
          message: "Running branched simulation…",
        });
        const simPayload = buildSimulationPayload({
          scenarioId,
          normalize,
          signals,
          enrichment,
        });
        const simulationRaw = await runBranchedSimulation(simPayload) as unknown as Record<string, unknown>;
        const simulation = adaptSimulationResponse(simulationRaw);
        setState((prev) => ({
          ...prev,
          simulation,
          selectedBranchId: simulation.branches?.[0]?.branch_id ?? null,
          selectedInterventionId:
            simulation.interventions?.[0]?.intervention_id ?? null,
        }));
        setStage("simulation", { state: "ready", message: "Simulation complete" });

        /* 6 — Branched decision */
        setStage("decision", {
          state: "loading",
          message: "Computing decision surface…",
        });
        const decPayload = buildDecisionPayload({ scenarioId, simulationRaw });
        const decisionRaw = await computeBranchedDecision(decPayload) as unknown as Record<string, unknown>;
        const decision = adaptDecisionResponse(decisionRaw);
        setState((prev) => ({ ...prev, decision }));
        setStage("decision", { state: "ready", message: "Decision computed" });

        /* 7 — Intelligence brief */
        setStage("brief", {
          state: "loading",
          message: "Generating intelligence brief…",
        });
        const briefPayload = buildBriefPayload({
          scenarioId,
          signals,
          simulationRaw,
          decisionRaw,
        });
        const briefRaw = await generateBranchedBrief(briefPayload) as unknown as Record<string, unknown>;
        const brief = adaptBriefResponse(briefRaw);
        setState((prev) => ({ ...prev, brief }));
        setStage("brief", { state: "ready", message: "Brief generated" });

        /* 8 — Analyst layer */
        setStage("analysis", {
          state: "loading",
          message: "Querying analyst layer…",
        });
        const analysisPayload = buildAnalysisPayload({
          scenarioId,
          question: "What is the best next action and why?",
          simulationRaw,
          decisionRaw,
          briefRaw,
        });
        const analysisRaw = await queryBranchedAnalysis(analysisPayload) as unknown as Record<string, unknown>;
        const analysis = adaptAnalysisResponse(analysisRaw);
        setState((prev) => ({ ...prev, analysis }));
        setStage("analysis", { state: "ready", message: "Analyst response ready" });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unexpected pipeline failure";
        setState((prev) => ({ ...prev, error: message }));
        // Mark current loading stage as error
        setState((prev) => ({
          ...prev,
          statuses: prev.statuses.map((s) =>
            s.state === "loading" ? { ...s, state: "error" as const, message } : s
          ),
        }));
      } finally {
        setState((prev) => ({ ...prev, isRunning: false }));
      }
    },
    [resetDownstream, setStage]
  );

  /* ── Derived ───────────────────────────────────────── */
  const topConfidence = useMemo(() => {
    return (
      state.decision?.decision_confidence ??
      state.simulation?.uncertainty_envelope?.stage_scores?.["decision"] ??
      null
    );
  }, [state.decision, state.simulation]);

  const completedStages = useMemo(
    () => state.statuses.filter((s) => s.state === "ready").length,
    [state.statuses]
  );

  return {
    state,
    runPipeline,
    setState,
    topConfidence,
    completedStages,
  };
}
