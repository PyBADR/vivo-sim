import type { NormalizeResponse } from "./scenario";
import type { SignalsResponse } from "./signals";
import type { GraphBuildResponse, GraphEnrichResponse } from "./graph";
import type { BranchedSimulationResponse } from "./simulation";
import type { BranchedDecisionResponse, BranchedBriefResponse, BranchedAnalysisResponse } from "./decision";

export type Nullable<T> = T | null;

export type StageKey =
  | "scenario"
  | "signals"
  | "graph"
  | "enrichment"
  | "simulation"
  | "decision"
  | "brief"
  | "analysis";

export interface StageStatus {
  key: StageKey;
  label: string;
  state: "idle" | "loading" | "ready" | "error";
  message?: string;
}

export interface ControlRoomState {
  scenarioInput: string;
  statuses: StageStatus[];
  normalize: Nullable<NormalizeResponse>;
  signals: Nullable<SignalsResponse>;
  graph: Nullable<GraphBuildResponse>;
  enrichment: Nullable<GraphEnrichResponse>;
  simulation: Nullable<BranchedSimulationResponse>;
  decision: Nullable<BranchedDecisionResponse>;
  brief: Nullable<BranchedBriefResponse>;
  analysis: Nullable<BranchedAnalysisResponse>;
  selectedBranchId: Nullable<string>;
  selectedInterventionId: Nullable<string>;
  isRunning: boolean;
  error: Nullable<string>;
}
