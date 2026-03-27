/* ═══════════════════════════════════════════════════════════════════
   Deevo Sim — TypeScript Contracts
   ═══════════════════════════════════════════════════════════════════
   Mirrors backend Pydantic schemas exactly. Every field name, type,
   and constraint matches app/schemas/*.py.

   Pipeline dependency chain:
     x → S → Σ → G → Ĝ → Z(0:T) → D → B → Q

   Each type below is the frontend representation of one computational
   state object in the Deevo staged transformation system.
   ═══════════════════════════════════════════════════════════════════ */

// ─── Enums (match backend str Enums) ────────────────────────────

export type Region =
  | 'GCC' | 'Saudi' | 'UAE' | 'Qatar'
  | 'Kuwait' | 'Bahrain' | 'Oman' | 'Multi-region'

export type TriggerType =
  | 'airspace' | 'shipping' | 'banking' | 'market'
  | 'military' | 'policy' | 'social'

export type Domain =
  | 'aviation' | 'energy' | 'banking' | 'logistics'
  | 'ecommerce' | 'tourism' | 'insurance'
  | 'public_sector' | 'private_sector' | 'multi_sector'

export type SignalKind = 'structured' | 'unstructured' | 'market'

export type SignalCategory =
  | 'aviation' | 'shipping' | 'banking' | 'media'
  | 'market' | 'policy' | 'energy' | 'social' | 'logistics'

export type EntityType =
  | 'country' | 'airport' | 'airline' | 'bank' | 'port'
  | 'ministry' | 'regulator' | 'platform' | 'media'
  | 'commodity' | 'sector' | 'public_cluster'
  | 'private_cluster' | 'route'

export type EdgeType =
  | 'operates_in' | 'routes_through' | 'depends_on'
  | 'exposed_to' | 'regulates' | 'influences'
  | 'supplies' | 'settles_in' | 'constrained_by' | 'amplifies'

export type Stance = 'positive' | 'neutral' | 'negative' | 'uncertain'

export type EmotionalState =
  | 'stable' | 'concerned' | 'fearful' | 'panicked' | 'reassured'

export type PhaseLabel = 'T0' | 'T1' | 'T2' | 'T3' | 'T4' | 'T5'

export type Horizon = '6h' | '24h' | '7d' | '30d'

export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical'

export type StrategyType =
  | 'transparent' | 'delayed' | 'defensive' | 'silent' | 'phased'

export type ConstraintType =
  | 'CZIB' | 'NOTAM' | 'route_closure'
  | 'bank_continuity' | 'port_disruption'

// ─── Common Structures ──────────────────────────────────────────

export interface MoneyRange {
  currency: string   // 3-char ISO
  low: number        // >= 0
  high: number       // >= 0
}

export interface Assumption {
  text: string
  source?: string
}

// ─── Layer 1: Scenario Normalization (S) ────────────────────────
// S = f_norm(x) = {e, a, ℓ, τ, κ, ρ, ω}

export interface ScenarioNormalizeRequest {
  raw_text: string                   // min 10 chars
  region_hint?: Region
  domain_hint?: Domain
  preferred_horizon?: Horizon
  source_refs?: string[]
}

export interface ScenarioTrigger {
  type: TriggerType
  label: string
  severity: number                   // [0, 1]
  timestamp: string                  // ISO 8601
}

export interface ScenarioConstraint {
  type: ConstraintType
  active: boolean
  details: string
  severity: number                   // [0, 1]
}

/** S — the normalized scenario state object */
export interface NormalizedScenario {
  scenario_id: string
  title: string
  raw_text: string
  region: Region
  domain: Domain
  trigger: ScenarioTrigger
  actors: string[]
  signal_categories: string[]
  constraints: ScenarioConstraint[]
  time_horizon_hours: number         // [1, 720]
  assumptions: Assumption[]
  confidence: number                 // [0, 1] — C_norm
}

// ─── Layer 2: Signal Extraction (Σ) ─────────────────────────────
// Σ = f_sig(S), each σ_i = (type, strength, direction, confidence, relevance)

export interface RawSource {
  source_type: string
  source_name?: string
  content: string
  published_at?: string
}

export interface SignalExtractionRequest {
  scenario_id: string
  raw_sources?: RawSource[]
}

/** σ_i — a single evidence signal */
export interface Signal {
  id: string
  source: string
  kind: SignalKind
  category: SignalCategory
  value: string | number
  velocity: number                   // >= 0
  volatility: number                 // >= 0
  timestamp: string
  confidence: number                 // [0, 1]
}

/** Σ — the full signal extraction response */
export interface SignalExtractionResponse {
  scenario_id: string
  signals: Signal[]
  extracted_count: number
  confidence: number                 // [0, 1]
}

// ─── Layer 3: Graph Construction (G) ────────────────────────────
// G = (V, E, W) = f_graph(S, Σ)

export interface GraphNode {
  id: string
  label: string
  type: EntityType
  region?: string
  metadata: Record<string, unknown>
}

export interface GraphEdge {
  source: string
  target: string
  type: EdgeType
  weight: number                     // [0, 1]
  metadata: Record<string, unknown>
}

export interface GraphBuildRequest {
  scenario_id: string
  normalized_scenario: Record<string, unknown>
  signals?: Record<string, unknown>[]
}

/** G₀ — the initial relational graph */
export interface GraphBuildResponse {
  scenario_id: string
  nodes: GraphNode[]
  edges: GraphEdge[]
  confidence: number                 // [0, 1]
}

// ─── Layer 4: Graph Enrichment (Ĝ) ─────────────────────────────
// Ĝ = f_enrich(G)

export interface EnrichedGraphNode extends GraphNode {
  influence_score: number            // [0, 1] — I_i composite
  trust_score: number                // [0, 1]
  propagation_score: number          // [0, 1]
  stance: Stance
}

export interface GraphEnrichRequest {
  scenario_id: string
  nodes: GraphNode[]
  edges: GraphEdge[]
  signals?: Record<string, unknown>[]
}

/** Ĝ — the enriched graph with node centrality + inferred edges */
export interface GraphEnrichResponse {
  scenario_id: string
  nodes: EnrichedGraphNode[]
  edges: GraphEdge[]
  confidence: number                 // [0, 1]
}

// ─── Layer 5: Simulation (Z₀:T) ────────────────────────────────
// Z(0:T) = f_sim(Ĝ, Σ, S)

export interface AirportState {
  airport_code: string
  airspace_risk: number              // [0, 1]
  reroute_severity: number
  cancellation_risk: number
  cargo_delay_risk: number
  passenger_confidence_risk: number
  composite_risk: number
}

export interface SectorState {
  sector: string
  direct_impact: number              // [0, 1]
  indirect_impact: number
  composite_impact: number
}

export interface MarketState {
  oil_stress: number                 // [0, 1]
  gold_stress: number
  fx_stress: number
  crypto_stress: number
  shipping_stress: number
  composite_market_stress: number
}

/** Z(t) — one simulation phase (time step) */
export interface SimulationPhase {
  phase: PhaseLabel
  label: string
  airport_stress: number             // [0, 1]
  shipping_stress: number
  banking_stress: number
  media_stress: number
  public_stress: number
  energy_stress: number
  market_stress: number
  logistics_stress: number
  policy_stress: number
  total_risk_score: number           // [0, 1] — E_Z(t)
  key_events: string[]
}

export interface SimulationRunRequest {
  scenario_id: string
  normalized_scenario: Record<string, unknown>
  signals?: Record<string, unknown>[]
  nodes?: Record<string, unknown>[]
  edges?: Record<string, unknown>[]
  agent_profiles?: Record<string, unknown>[]
  strategy?: StrategyType
}

/** Z(0:T) — the full simulation trajectory */
export interface SimulationRunResponse {
  scenario_id: string
  phases: SimulationPhase[]
  airport_states: AirportState[]
  sector_states: SectorState[]
  market_state?: MarketState
  spread_velocity: number            // [0, 1]
  critical_window: string
  confidence: number                 // [0, 1]
}

// ─── Layer 6: Agent Profiles ────────────────────────────────────

export interface AgentProfile {
  id: string
  role: string
  influence_score: number
  trust_score: number
  propagation_score: number
  stance: Stance
  reaction_delay_hours: number
  amplification_factor: number
  preferred_channel: string
  emotional_state: EmotionalState
  memory_state: Record<string, unknown>
}

export interface AgentProfileRequest {
  scenario_id: string
  enriched_nodes: Record<string, unknown>[]
  edges: Record<string, unknown>[]
}

export interface AgentProfileResponse {
  scenario_id: string
  agent_profiles: AgentProfile[]
  confidence: number
}

// ─── Layer 7: Decision Computation (D) ──────────────────────────
// D(a_j) = θ₁R + θ₂M + θ₃F + θ₄T − θ₅C − θ₆H

export interface CustomerImpact {
  passenger_confidence_risk: number  // [0, 1]
  churn_risk: number                 // [0, 1]
}

export interface DecisionComputeRequest {
  scenario_id: string
  simulation_response: Record<string, unknown>
}

/** D — the scored action surface */
export interface DecisionOutput {
  scenario_id: string
  risk_level: RiskLevel
  risk_score: number                 // [0, 1]
  spread_velocity: number            // [0, 1]
  primary_driver: string
  critical_window: string
  financial_impact: MoneyRange
  customer_impact: CustomerImpact
  regulatory_risk: number            // [0, 1]
  reputation_score: number           // [0, 1]
  recommended_actions: string[]
  assumptions: Assumption[]
  confidence: number                 // [0, 1] — Conf_D
}

// ─── Layer 8: Intelligence Brief (B) ────────────────────────────
// B = f_brief(S, Σ, Ĝ, Z, D, U)

export interface ForecastBlock {
  base_case: string
  pessimistic_case: string
  controlled_response_case: string
}

export interface BusinessImpactBlock {
  airports: string
  logistics: string
  tourism: string
  banking: string
  ecommerce?: string
  energy?: string
}

export interface BriefGenerateRequest {
  scenario_id: string
  decision_output: Record<string, unknown>
  simulation_response: Record<string, unknown>
  signals?: Record<string, unknown>[]
}

/** B — the compressed executive intelligence projection */
export interface IntelligenceBrief {
  scenario_id: string
  scenario_summary: string
  timeline_narrative: string
  key_drivers: string[]
  entity_influence: string[]
  forecast: ForecastBlock
  business_impact: BusinessImpactBlock
  recommended_actions: string[]
  assumptions: Assumption[]
  confidence: number                 // [0, 1]
}

// ─── Layer 9: Analyst Query (Q) ─────────────────────────────────
// Q(y | S, Σ, Ĝ, Z, D, B, U)

export interface AnalysisQueryRequest {
  scenario_id: string
  question: string                   // min 3 chars
  decision_output: Record<string, unknown>
  intelligence_brief: Record<string, unknown>
  simulation_response: Record<string, unknown>
}

/** Q — grounded analyst response */
export interface AnalysisQueryResponse {
  scenario_id: string
  answer: string
  top_drivers: string[]
  top_entities: string[]
  counterfactuals: string[]
  confidence: number                 // [0, 1]
}

// ─── Pipeline State Container ───────────────────────────────────
// Tracks the complete computational state evolution

export type PipelineStage =
  | 'idle'
  | 'normalizing'   // → S
  | 'extracting'    // → Σ
  | 'building'      // → G
  | 'enriching'     // → Ĝ
  | 'simulating'    // → Z(0:T)
  | 'deciding'      // → D
  | 'briefing'      // → B
  | 'complete'
  | 'error'

export interface PipelineError {
  stage: PipelineStage
  message: string
  timestamp: string
}

/** Complete computed state — the union of all pipeline outputs */
export interface ComputedState {
  scenario: NormalizedScenario | null
  signals: SignalExtractionResponse | null
  graph: GraphBuildResponse | null
  enrichedGraph: GraphEnrichResponse | null
  simulation: SimulationRunResponse | null
  agents: AgentProfileResponse | null
  decision: DecisionOutput | null
  brief: IntelligenceBrief | null
}
