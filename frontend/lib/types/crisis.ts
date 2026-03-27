export interface CrisisScenarioPack {
  scenario_id: string;
  title: string;
  categories: string[];
}

export interface NodeImpact {
  node_id: string;
  label: string;
  node_type: string;
  probability_of_disruption: number;
  severity_score: number;
  time_to_impact_hours: number | null;
  ripple_effect: string[];
  country?: string;
  tags?: string[];
}

export interface AirportImpact {
  airport_code: string;
  airport_name: string;
  rerouting_pressure: number;
  fuel_stress: number;
  congestion_pressure: number;
  insurance_operating_stress: number;
  disruption_score: number;
  probability_of_disruption?: number;
  severity_score?: number;
  time_to_impact_hours?: number | null;
  ripple_effect?: string[];
}

export interface EnergyImpact {
  oil_shock: number;
  refining_stress: number;
  logistics_delay: number;
  fuel_impact_score: number;
}

export interface ECommerceImpact {
  delay: number;
  inventory_stress: number;
  demand_volatility: number;
  payment_friction: number;
  ecommerce_disruption_score: number;
}

export interface MaritimeTradeImpact {
  chokepoint_pressure: number;
  port_delay: number;
  insurance_cost_surge: number;
  rerouting_stress: number;
  maritime_trade_score: number;
}

export interface FinancialStressImpact {
  oil_volatility: number;
  liquidity_stress: number;
  sentiment_shock: number;
  insurance_repricing: number;
  market_stress_score: number;
}

export interface SupplyChainImpact {
  food_imports_stress: number;
  medicine_supply_stress: number;
  airport_cargo_stress: number;
  last_mile_pressure: number;
  supply_chain_score: number;
}

export interface SocialResponseImpact {
  panic_buying: number;
  media_amplification: number;
  trust_loss: number;
  official_stabilization: number;
  public_reaction_score: number;
}

export interface PropagationStep {
  step: number;
  node_scores: Record<string, number>;
  total_energy: number;
}

export interface RankedAction {
  action_id: string;
  label: string;
  risk_reduction: number;
  feasibility: number;
  timeliness: number;
  cost: number;
  second_order_risk: number;
  action_score: number;
  rationale: string;
}

export interface ExecutiveActionBundle {
  primary_action: string;
  secondary_actions: string[];
  top_risks: string[];
  top_nodes: string[];
  decision_summary: string;
}

export interface CrisisAssessment {
  scenario_id: string;
  branch_id?: string | null;
  summary: string;

  node_impacts?: NodeImpact[];
  airport_impacts: AirportImpact[];

  energy_impact?: EnergyImpact | null;
  ecommerce_impact?: ECommerceImpact | null;
  maritime_trade_impact?: MaritimeTradeImpact | null;
  financial_stress_impact?: FinancialStressImpact | null;
  supply_chain_impact?: SupplyChainImpact | null;
  social_response_impact?: SocialResponseImpact | null;

  propagation: PropagationStep[];
  ranked_actions: RankedAction[];
  executive_action_bundle?: ExecutiveActionBundle | null;
}
