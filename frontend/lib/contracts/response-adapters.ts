/**
 * Response adapters.
 *
 * The backend returns raw dict structures. These adapters
 * map them into the typed frontend display interfaces used by panels.
 *
 * Backend run-branched returns:
 *   { baseline_response, branch_envelope, propagation_state,
 *     uncertainty_envelope, intervention_set }
 *
 * Frontend panels expect:
 *   BranchedSimulationResponse { branches, aggregate_energy_series,
 *     uncertainty_envelope, interventions, ... }
 */

import type { BranchedSimulationResponse, BranchTrajectorySummary, EnergyPoint, InterventionOption, UncertaintyEnvelope } from "@/lib/types/simulation";
import type { BranchedDecisionResponse, RankedAction, BranchedBriefResponse, BranchedAnalysisResponse } from "@/lib/types/decision";

/* ── Simulation adapter ────────────────────────────────────── */

export function adaptSimulationResponse(raw: Record<string, unknown>): BranchedSimulationResponse {
  const branchEnv = (raw.branch_envelope ?? {}) as Record<string, unknown>;
  const propState = (raw.propagation_state ?? {}) as Record<string, unknown>;
  const uncEnv = (raw.uncertainty_envelope ?? {}) as Record<string, unknown>;
  const intvSet = (raw.intervention_set ?? {}) as Record<string, unknown>;
  const baseline = (raw.baseline_response ?? {}) as Record<string, unknown>;

  // Extract branches from branch_envelope
  const rawBranches = (branchEnv.branches ?? []) as Record<string, unknown>[];
  const branches: BranchTrajectorySummary[] = rawBranches.map((b) => ({
    branch_id: String(b.branch_id ?? ""),
    branch_label: String(b.branch_label ?? ""),
    branch_probability: Number(b.branch_probability ?? 0),
    trigger: b.branch_trigger ? String(b.branch_trigger) : undefined,
    peak_impact: b.outcome ? Number((b.outcome as Record<string, unknown>).peak_risk_score ?? 0) : undefined,
    time_to_peak: b.outcome ? Number((b.outcome as Record<string, unknown>).critical_window ?? 0) : undefined,
  }));

  // Extract energy series from propagation_state
  const rawEnergy = (propState.energy_series ?? {}) as Record<string, unknown>;
  const rawEnergyValues = (rawEnergy.energy_values ?? []) as number[];
  const aggregate_energy_series: EnergyPoint[] = rawEnergyValues.map((val, idx) => ({
    step: idx,
    value: Number(val),
  }));

  // Extract uncertainty
  const uncertainty_envelope: UncertaintyEnvelope = {
    stage_scores: (uncEnv.stage_scores ?? []) as unknown as Record<string, number>,
    key_drivers: (uncEnv.key_drivers ?? []) as string[],
    branch_entropy: uncEnv.branch_entropy != null ? Number(uncEnv.branch_entropy) : undefined,
    simulation_variance: uncEnv.simulation_variance != null ? Number(uncEnv.simulation_variance) : undefined,
    notes: (uncEnv.notes ?? []) as string[],
  };

  // Extract interventions
  const rawInterventions = (intvSet.interventions ?? []) as Record<string, unknown>[];
  const interventions: InterventionOption[] = rawInterventions.map((i) => ({
    intervention_id: String(i.intervention_id ?? ""),
    label: String(i.label ?? ""),
    target_nodes: (i.targets as Record<string, unknown>[] ?? []).flatMap(
      (t) => (t.target_node_ids ?? []) as string[]
    ),
    intended_effect: i.label ? String(i.label) : undefined,
    estimated_cost: i.estimated_cost != null ? Number(i.estimated_cost) : undefined,
    confidence: i.confidence != null ? Number(i.confidence) : undefined,
    reduction_in_peak_impact: i.peak_reduction != null ? Number(i.peak_reduction) : undefined,
    efficiency_score: i.efficiency_score != null ? Number(i.efficiency_score) : undefined,
  }));

  // Extract outcomes
  const expectedPeak = branchEnv.expected_peak_risk != null ? Number(branchEnv.expected_peak_risk) : undefined;
  const worstPeak = branchEnv.worst_case_peak_risk != null ? Number(branchEnv.worst_case_peak_risk) : undefined;
  const bestPeak = branchEnv.best_case_peak_risk != null ? Number(branchEnv.best_case_peak_risk) : undefined;

  // Extract phases from baseline for time_to_peak
  const phases = (baseline.phases ?? []) as Record<string, unknown>[];
  const peakPhaseIdx = phases.reduce(
    (maxIdx, phase, idx) =>
      Number(phase.total_risk_score ?? 0) > Number(phases[maxIdx]?.total_risk_score ?? 0) ? idx : maxIdx,
    0
  );

  return {
    branches,
    expected_outcome: expectedPeak != null ? { peak_impact: expectedPeak, time_to_peak: peakPhaseIdx } : undefined,
    worst_case_outcome: worstPeak != null ? { peak_impact: worstPeak } : undefined,
    best_case_outcome: bestPeak != null ? { peak_impact: bestPeak } : undefined,
    aggregate_energy_series,
    uncertainty_envelope,
    interventions,
  };
}

/* ── Decision adapter ──────────────────────────────────────── */

export function adaptDecisionResponse(raw: Record<string, unknown>): BranchedDecisionResponse {
  const rawActions = (raw.ranked_actions ?? []) as Record<string, unknown>[];
  const ranked_actions: RankedAction[] = rawActions.map((a) => ({
    action_id: String(a.action_id ?? a.label ?? ""),
    label: String(a.label ?? ""),
    decision_score: Number(a.decision_score ?? a.total_score ?? 0),
    risk_reduction: a.risk_reduction != null ? Number(a.risk_reduction) : undefined,
    operational_impact: a.operational_impact != null ? Number(a.operational_impact) : undefined,
    feasibility: a.feasibility != null ? Number(a.feasibility) : undefined,
    timeliness: a.timeliness != null ? Number(a.timeliness) : undefined,
    cost: a.cost != null ? Number(a.cost) : undefined,
    downside_risk: a.downside_risk != null ? Number(a.downside_risk) : undefined,
    branch_aware_rationale: a.branch_aware_rationale ? String(a.branch_aware_rationale) : undefined,
    intervention_aware_rationale: a.intervention_aware_rationale ? String(a.intervention_aware_rationale) : undefined,
  }));

  // Decision output may be nested
  const decisionOutput = (raw.decision_output ?? raw) as Record<string, unknown>;

  return {
    ranked_actions,
    top_action: ranked_actions[0] ?? undefined,
    score_margin_to_second: raw.score_margin_to_second != null ? Number(raw.score_margin_to_second) : undefined,
    decision_confidence: raw.decision_uncertainty != null ? Number(1 - Number(raw.decision_uncertainty)) : undefined,
    decision_rationale_summary: raw.rationales
      ? String((raw.rationales as Record<string, unknown>).decision ?? "")
      : decisionOutput.recommended_strategy
        ? String(decisionOutput.recommended_strategy)
        : undefined,
  };
}

/* ── Brief adapter ─────────────────────────────────────────── */

export function adaptBriefResponse(raw: Record<string, unknown>): BranchedBriefResponse {
  const brief = (raw.brief ?? raw) as Record<string, unknown>;

  return {
    executive_summary: String(brief.executive_summary ?? brief.summary ?? "No summary available"),
    key_actors: (brief.key_actors ?? brief.top_influencers ?? []) as string[],
    spread_pattern: String(brief.spread_assessment ?? brief.spread_pattern ?? "Unknown"),
    top_risks: (brief.risk_factors ?? brief.top_risks ?? []) as string[],
    recommended_action: String(brief.recommended_response ?? brief.recommended_action ?? "No recommendation"),
    uncertainty_statement: String(raw.uncertainty_statement ?? brief.uncertainty_statement ?? ""),
    formatted_narrative: raw.intervention_summary ? String(raw.intervention_summary) : undefined,
  };
}

/* ── Analysis adapter ──────────────────────────────────────── */

export function adaptAnalysisResponse(raw: Record<string, unknown>): BranchedAnalysisResponse {
  const response = (raw.response ?? raw) as Record<string, unknown>;

  return {
    answer: String(response.answer ?? response.summary ?? "No analysis available"),
    evidence: (raw.evidence_references ?? response.evidence ?? []) as string[],
    dependency_trace: (raw.dependency_trace ?? []) as string[],
    uncertainty_note: String(raw.uncertainty_note ?? response.uncertainty_note ?? ""),
    suggested_next_check: raw.suggested_next_check ? String(raw.suggested_next_check) : undefined,
  };
}
