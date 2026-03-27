/* ── Decision Engine ──
   Final decision outputs from combined risk scoring.

   RiskScore = Geo + Econ + Exposure + Propagation + Behavior
   AdjustedRisk = BaseRisk + ExternalSignalModifier

   Returns: decision, confidence, financial_impact, affected_entities, reasoning */

import type { PropagationResult, NodeImpactResult } from "./propagation";
import type { InsuranceExposureResult } from "./insurance";
import type { SignalSummary } from "./signals";

/* ── Risk Components ── */

export interface RiskComponents {
  geopolitical: number;       // 0-1
  economic: number;           // 0-1
  exposure: number;           // 0-1
  propagation: number;        // 0-1
  behavioral: number;         // 0-1
}

export interface DecisionOutput {
  decision: "hold" | "escalate" | "activate_response" | "emergency_protocol";
  confidence: number;
  riskScore: number;
  adjustedRisk: number;
  financial_impact: {
    estimated_loss_range: string;
    currency: string;
    confidence_interval: string;
    sectors_affected: string[];
  };
  affected_entities: Array<{
    id: string;
    label: string;
    impact: number;
    sector: string;
  }>;
  reasoning: string[];
  recommended_actions: string[];
  decision_deadline: string;
  timestamp: string;
}

/* ── Risk Weights ── */

const RISK_WEIGHTS = {
  geopolitical: 0.25,
  economic: 0.20,
  exposure: 0.20,
  propagation: 0.20,
  behavioral: 0.15,
} as const;

/* ── Compute Base Risk ── */

export function computeRiskScore(components: RiskComponents): number {
  return (
    components.geopolitical * RISK_WEIGHTS.geopolitical +
    components.economic * RISK_WEIGHTS.economic +
    components.exposure * RISK_WEIGHTS.exposure +
    components.propagation * RISK_WEIGHTS.propagation +
    components.behavioral * RISK_WEIGHTS.behavioral
  );
}

/* ── External Signal Modifier ── */

export function computeSignalModifier(signalSummary: SignalSummary): number {
  if (signalSummary.totalSignals === 0) return 0;
  return signalSummary.compositeScore * 0.15; // Max 15% uplift from signals
}

/* ── Decision Thresholds ── */

function decisionFromRisk(
  adjustedRisk: number
): DecisionOutput["decision"] {
  if (adjustedRisk >= 0.80) return "emergency_protocol";
  if (adjustedRisk >= 0.55) return "activate_response";
  if (adjustedRisk >= 0.30) return "escalate";
  return "hold";
}

/* ── Confidence Calculation ── */

function computeConfidence(
  signalCount: number,
  propagationDepth: number,
  nodesAffected: number
): number {
  // More signals + deeper propagation + more affected nodes = higher confidence
  const signalConfidence = Math.min(signalCount / 10, 1) * 0.30;
  const depthConfidence = Math.min(propagationDepth / 5, 1) * 0.25;
  const coverageConfidence = Math.min(nodesAffected / 50, 1) * 0.25;
  const base = 0.20; // Minimum structural confidence from model
  return Math.min(base + signalConfidence + depthConfidence + coverageConfidence, 1);
}

/* ── Financial Impact Estimation ── */

function estimateFinancialImpact(
  adjustedRisk: number,
  insuranceResult: InsuranceExposureResult,
  nodesAffected: number
): DecisionOutput["financial_impact"] {
  // Rough estimation based on GCC insurance market size (~$30B)
  const baseLoss = adjustedRisk * 30_000; // $M
  const lowerBound = Math.round(baseLoss * 0.6);
  const upperBound = Math.round(baseLoss * 1.4);

  const sectors = insuranceResult.lines
    .filter((l) => l.estimatedImpactPct > 10)
    .map((l) => l.line);

  return {
    estimated_loss_range: `$${lowerBound}M - $${upperBound}M`,
    currency: "USD",
    confidence_interval: `${Math.round((1 - adjustedRisk * 0.3) * 100)}%`,
    sectors_affected: sectors,
  };
}

/* ── Reasoning Generator ── */

function generateReasoning(
  components: RiskComponents,
  propagation: PropagationResult,
  insurance: InsuranceExposureResult,
  adjustedRisk: number
): string[] {
  const reasons: string[] = [];

  if (components.geopolitical >= 0.6) {
    reasons.push(`Geopolitical risk elevated at ${Math.round(components.geopolitical * 100)}% — regional escalation scenario active.`);
  }

  if (components.propagation >= 0.5) {
    reasons.push(`Propagation engine shows ${propagation.affectedNodes.length} nodes affected across ${propagation.maxDepth} cascade levels.`);
  }

  if (components.exposure >= 0.5) {
    reasons.push(`Insurance exposure at ${insurance.total_estimated_impact_pct}% average portfolio impact. Fraud alert: ${insurance.fraud_alert_level}.`);
  }

  const topNodes = propagation.topVulnerabilities.slice(0, 3);
  if (topNodes.length > 0) {
    reasons.push(
      `Top vulnerabilities: ${topNodes.map((n) => `${n.label} (${Math.round(n.impactScore * 100)}%)`).join(", ")}.`
    );
  }

  if (adjustedRisk >= 0.55) {
    reasons.push(`Adjusted risk score ${Math.round(adjustedRisk * 100)}% exceeds activation threshold (55%). Response protocol recommended.`);
  }

  return reasons;
}

/* ── Main Decision Function ── */

export function generateDecision(
  propagation: PropagationResult,
  insurance: InsuranceExposureResult,
  signals: SignalSummary,
  overrides?: Partial<RiskComponents>
): DecisionOutput {
  // Derive risk components from real data
  const avgPropImpact =
    propagation.affectedNodes.length > 0
      ? propagation.totalEnergy / propagation.affectedNodes.length
      : 0;

  const components: RiskComponents = {
    geopolitical: overrides?.geopolitical ?? Math.min(signals.avgSeverity * 1.2, 1),
    economic: overrides?.economic ?? Math.min(insurance.total_estimated_impact_pct / 100, 1),
    exposure: overrides?.exposure ?? Math.min(
      insurance.lines.reduce((s, l) => s + l.severityUplift - 1, 0) / insurance.lines.length,
      1
    ),
    propagation: overrides?.propagation ?? Math.min(avgPropImpact, 1),
    behavioral: overrides?.behavioral ?? Math.min(signals.compositeScore, 1),
  };

  const baseRisk = computeRiskScore(components);
  const signalMod = computeSignalModifier(signals);
  const adjustedRisk = Math.min(baseRisk + signalMod, 1);
  const decision = decisionFromRisk(adjustedRisk);
  const confidence = computeConfidence(signals.totalSignals, propagation.maxDepth, propagation.affectedNodes.length);
  const financialImpact = estimateFinancialImpact(adjustedRisk, insurance, propagation.affectedNodes.length);
  const reasoning = generateReasoning(components, propagation, insurance, adjustedRisk);

  // Decision deadline based on urgency
  const hoursUntilDeadline =
    decision === "emergency_protocol" ? 2 :
    decision === "activate_response" ? 6 :
    decision === "escalate" ? 24 : 72;

  const deadline = new Date(Date.now() + hoursUntilDeadline * 3_600_000).toISOString();

  const affectedEntities = propagation.topVulnerabilities.slice(0, 10).map((n) => ({
    id: n.nodeId,
    label: n.label,
    impact: n.impactScore,
    sector: n.sector,
  }));

  const recommendedActions = insurance.underwriting_actions.slice(0, 3).concat(
    insurance.claims_actions.slice(0, 2)
  );

  return {
    decision,
    confidence: Math.round(confidence * 100) / 100,
    riskScore: Math.round(baseRisk * 100) / 100,
    adjustedRisk: Math.round(adjustedRisk * 100) / 100,
    financial_impact: financialImpact,
    affected_entities: affectedEntities,
    reasoning,
    recommended_actions: recommendedActions,
    decision_deadline: deadline,
    timestamp: new Date().toISOString(),
  };
}
