/**
 * Scenario types — aligned with backend NormalizedScenario + ScenarioNormalizeRequest.
 */

export interface NormalizeRequest {
  scenario_text: string;
}

/* ── Backend NormalizedScenario response ────────────────── */

export interface ScenarioTrigger {
  type: string;
  label: string;
  severity: number;
  timestamp: string;
}

export interface ScenarioConstraint {
  type: string;
  active: boolean;
  details: string;
  severity: number;
}

export interface ScenarioAssumption {
  text: string;
  source: string;
}

export interface NormalizeResponse {
  confidence: number;
  scenario_id: string;
  title: string;
  raw_text: string;
  region: string;
  domain: string;
  trigger: ScenarioTrigger;
  actors: string[];
  signal_categories: string[];
  constraints: ScenarioConstraint[];
  time_horizon_hours: number;
  assumptions: ScenarioAssumption[];
}
