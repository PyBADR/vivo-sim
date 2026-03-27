/* ── Decision Intelligence Types ── */

export interface DecisionOption {
  option_id: string;
  title: string;
  description: string;
  risk_reduction: number;
  cost_estimate: string;
  time_to_implement: string;
  confidence: number;
  trade_offs: string[];
  dependencies: string[];
  recommendation: "strongly_recommended" | "recommended" | "conditional" | "not_recommended";
}

export interface DecisionWindow {
  window_id: string;
  title: string;
  opens: string;
  closes: string;
  urgency: "critical" | "high" | "medium" | "low";
  actions_available: string[];
  cost_of_delay: string;
}

export interface CriticalNode {
  node_id: string;
  label: string;
  node_type: string;
  criticality_score: number;
  cascade_risk: number;
  downstream_count: number;
  intervention_options: string[];
  country?: string;
}

export interface ExecutiveNarrative {
  situation: string;
  implications: string[];
  recommended_actions: string[];
  confidence_statement: string;
  decision_deadline: string;
}

export interface ConfidenceBand {
  metric: string;
  lower_bound: number;
  central_estimate: number;
  upper_bound: number;
  confidence_level: number;
}

export interface DecisionIntelligenceBundle {
  scenario_id: string;
  decision_options: DecisionOption[];
  decision_windows: DecisionWindow[];
  critical_nodes: CriticalNode[];
  executive_narrative: ExecutiveNarrative | null;
  confidence_bands: ConfidenceBand[];
  overall_confidence: number;
}
