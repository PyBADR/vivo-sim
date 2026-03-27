export interface EnergyPoint {
  step: number;
  value: number;
}

export interface BranchTrajectorySummary {
  branch_id: string;
  branch_label: string;
  branch_probability: number;
  trigger?: string;
  peak_impact?: number;
  time_to_peak?: number;
}

export interface UncertaintyEnvelope {
  stage_scores?: Record<string, number>;
  key_drivers?: string[];
  branch_entropy?: number;
  simulation_variance?: number;
  notes?: string[];
}

export interface InterventionOption {
  intervention_id: string;
  label: string;
  target_nodes?: string[];
  target_edges?: string[];
  intended_effect?: string;
  estimated_cost?: number;
  confidence?: number;
  reduction_in_peak_impact?: number;
  efficiency_score?: number;
}

export interface BranchedSimulationResponse {
  branches: BranchTrajectorySummary[];
  expected_outcome?: { peak_impact?: number; time_to_peak?: number };
  worst_case_outcome?: { peak_impact?: number; time_to_peak?: number };
  best_case_outcome?: { peak_impact?: number; time_to_peak?: number };
  aggregate_energy_series?: EnergyPoint[];
  uncertainty_envelope?: UncertaintyEnvelope;
  interventions?: InterventionOption[];
  simulation_assumptions?: string[];
}
