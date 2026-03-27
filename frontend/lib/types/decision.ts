export interface RankedAction {
  action_id: string;
  label: string;
  decision_score: number;
  risk_reduction?: number;
  operational_impact?: number;
  feasibility?: number;
  timeliness?: number;
  cost?: number;
  downside_risk?: number;
  branch_aware_rationale?: string;
  intervention_aware_rationale?: string;
}

export interface BranchedDecisionResponse {
  ranked_actions: RankedAction[];
  top_action?: RankedAction;
  score_margin_to_second?: number;
  decision_confidence?: number;
  decision_rationale_summary?: string;
}

export interface BranchedBriefResponse {
  executive_summary: string;
  key_actors: string[];
  spread_pattern: string;
  top_risks: string[];
  recommended_action: string;
  uncertainty_statement: string;
  formatted_narrative?: string;
}

export interface BranchedAnalysisResponse {
  answer: string;
  evidence: string[];
  dependency_trace: string[];
  uncertainty_note: string;
  suggested_next_check?: string;
}
