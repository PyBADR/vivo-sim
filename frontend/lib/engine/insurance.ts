/* ── Insurance Exposure Layer ──
   Translates crisis signals into insurance business impact.
   10 lines of business × severity/frequency/fraud uplift × actions.

   FraudUplift =
     opportunism + network_risk + pattern_deviation + documentation_irregularity */

import type { PropagationResult, NodeImpactResult } from "./propagation";

/* ── Line of Business ── */

export type InsuranceLine =
  | "motor"
  | "health"
  | "travel"
  | "marine_cargo"
  | "property"
  | "liability"
  | "energy"
  | "credit_trade"
  | "life"
  | "takaful";

/* ── Line Impact ── */

export interface LineExposure {
  line: InsuranceLine;
  severityUplift: number;       // multiplier on base loss
  frequencyUplift: number;      // multiplier on claim frequency
  fraudUplift: number;          // 0-1
  underwritingAction: string;
  claimsAction: string;
  estimatedImpactPct: number;   // % of portfolio at risk
}

/* ── Fraud Model ── */

export interface FraudComponents {
  opportunism: number;             // 0-1: crisis = higher opportunistic fraud
  network_risk: number;            // 0-1: connected entities under stress
  pattern_deviation: number;       // 0-1: deviation from baseline claim patterns
  documentation_irregularity: number; // 0-1: expected doc issues in crisis
}

export function computeFraudUplift(f: FraudComponents): number {
  return Math.min(
    0.30 * f.opportunism +
    0.25 * f.network_risk +
    0.25 * f.pattern_deviation +
    0.20 * f.documentation_irregularity,
    1
  );
}

/* ── Portfolio Risk Summary ── */

export interface InsuranceExposureResult {
  portfolio_risk_summary: string;
  lines: LineExposure[];
  underwriting_actions: string[];
  claims_actions: string[];
  fraud_alert_level: "low" | "moderate" | "high" | "critical";
  executive_note: string;
  total_estimated_impact_pct: number;
}

/* ── Sector Impact Weights per Line ── */

const LINE_SECTOR_SENSITIVITY: Record<InsuranceLine, Record<string, number>> = {
  motor:        { aviation: 0.1, energy: 0.6, maritime: 0.2, finance: 0.3, insurance: 0.8 },
  health:       { aviation: 0.2, energy: 0.3, maritime: 0.1, finance: 0.2, insurance: 0.7 },
  travel:       { aviation: 0.9, energy: 0.4, maritime: 0.3, finance: 0.2, insurance: 0.6 },
  marine_cargo: { aviation: 0.1, energy: 0.5, maritime: 1.0, finance: 0.3, insurance: 0.7 },
  property:     { aviation: 0.1, energy: 0.4, maritime: 0.2, finance: 0.3, insurance: 0.6 },
  liability:    { aviation: 0.3, energy: 0.5, maritime: 0.4, finance: 0.4, insurance: 0.7 },
  energy:       { aviation: 0.1, energy: 1.0, maritime: 0.6, finance: 0.5, insurance: 0.8 },
  credit_trade: { aviation: 0.2, energy: 0.6, maritime: 0.7, finance: 0.9, insurance: 0.6 },
  life:         { aviation: 0.3, energy: 0.2, maritime: 0.1, finance: 0.4, insurance: 0.5 },
  takaful:      { aviation: 0.2, energy: 0.5, maritime: 0.3, finance: 0.4, insurance: 0.7 },
};

/* ── Underwriting Actions by Line ── */

const UW_ACTIONS: Record<InsuranceLine, string[]> = {
  motor:        ["Increase motor premiums in affected regions", "Restrict new fleet policies in high-risk zones"],
  health:       ["Increase health reserves for crisis-related claims", "Activate pandemic/emergency protocols"],
  travel:       ["Suspend new travel policies to affected destinations", "Activate mass cancellation provisions"],
  marine_cargo: ["Increase marine cargo rates for Hormuz routes", "Require enhanced documentation for Gulf shipments"],
  property:     ["Review property exposures in conflict zones", "Increase deductibles for force majeure"],
  liability:    ["Review D&O coverage for energy sector clients", "Increase liability reserves for supply chain failures"],
  energy:       ["Cease new energy underwriting in conflict zones", "Invoke war exclusion clauses"],
  credit_trade: ["Restrict trade credit for affected corridors", "Increase credit default provisions"],
  life:         ["Review group life for energy/military sector employees", "Increase accidental death reserves"],
  takaful:      ["Review takaful surplus distribution amid crisis", "Increase retakaful reserves"],
};

/* ── Claims Actions by Line ── */

const CLAIMS_ACTIONS: Record<InsuranceLine, string[]> = {
  motor:        ["Deploy surge adjusters for motor claims", "Flag opportunistic total loss claims"],
  health:       ["Streamline crisis-related health claims", "Monitor for phantom billing"],
  travel:       ["Process mass trip cancellation claims", "Validate disruption documentation"],
  marine_cargo: ["Fast-track cargo loss claims for Hormuz delays", "Deploy marine surveyors to Fujairah"],
  property:     ["Activate catastrophe response teams", "Monitor for inflated property damage claims"],
  liability:    ["Open bulk handler for supply chain liability", "Review subrogation opportunities"],
  energy:       ["Deploy energy loss adjusters", "Coordinate with reinsurers on large losses"],
  credit_trade: ["Monitor trade credit defaults", "Accelerate recovery actions on distressed accounts"],
  life:         ["Expedite accidental death claims", "Coordinate with government registries"],
  takaful:      ["Process takaful claims under emergency protocol", "Review risk-sharing pool adequacy"],
};

/* ── Main Calculation ── */

export function calculateInsuranceExposure(
  propagationResult: PropagationResult,
  sectorImpacts: {
    aviation: number;
    energy: number;
    maritime: number;
    finance: number;
  }
): InsuranceExposureResult {
  const avgImpact =
    propagationResult.affectedNodes.length > 0
      ? propagationResult.totalEnergy / propagationResult.affectedNodes.length
      : 0;

  const lines: LineExposure[] = (
    Object.keys(LINE_SECTOR_SENSITIVITY) as InsuranceLine[]
  ).map((line) => {
    const sens = LINE_SECTOR_SENSITIVITY[line];
    const sectorScore =
      (sectorImpacts.aviation * sens.aviation +
        sectorImpacts.energy * sens.energy +
        sectorImpacts.maritime * sens.maritime +
        sectorImpacts.finance * sens.finance) /
      4;

    const severityUplift = 1 + sectorScore * 1.5;   // up to 2.5x
    const frequencyUplift = 1 + sectorScore * 0.8;   // up to 1.8x

    const fraudComponents: FraudComponents = {
      opportunism: Math.min(sectorScore * 1.2, 1),
      network_risk: Math.min(avgImpact * 0.8, 1),
      pattern_deviation: Math.min(sectorScore * 0.9, 1),
      documentation_irregularity: Math.min(sectorScore * 0.6, 1),
    };
    const fraudUplift = computeFraudUplift(fraudComponents);

    const estimatedImpactPct = Math.min(sectorScore * 100, 100);

    return {
      line,
      severityUplift: Math.round(severityUplift * 100) / 100,
      frequencyUplift: Math.round(frequencyUplift * 100) / 100,
      fraudUplift: Math.round(fraudUplift * 100) / 100,
      underwritingAction: UW_ACTIONS[line][0],
      claimsAction: CLAIMS_ACTIONS[line][0],
      estimatedImpactPct: Math.round(estimatedImpactPct),
    };
  });

  const topLines = lines.sort((a, b) => b.estimatedImpactPct - a.estimatedImpactPct);
  const totalImpact = topLines.reduce((s, l) => s + l.estimatedImpactPct, 0) / topLines.length;
  const maxFraud = Math.max(...topLines.map((l) => l.fraudUplift));

  const fraudLevel: InsuranceExposureResult["fraud_alert_level"] =
    maxFraud >= 0.7 ? "critical" :
    maxFraud >= 0.5 ? "high" :
    maxFraud >= 0.3 ? "moderate" : "low";

  return {
    portfolio_risk_summary: `${propagationResult.affectedNodes.length} entities affected across ${new Set(propagationResult.affectedNodes.map((n) => n.sector)).size} sectors. Top exposure: ${topLines[0].line} (${topLines[0].estimatedImpactPct}% impact).`,
    lines: topLines,
    underwriting_actions: topLines.slice(0, 5).map((l) => l.underwritingAction),
    claims_actions: topLines.slice(0, 5).map((l) => l.claimsAction),
    fraud_alert_level: fraudLevel,
    executive_note: `Crisis propagation affects ${propagationResult.affectedNodes.length} nodes with ${Math.round(totalImpact)}% average portfolio exposure. Fraud uplift at ${fraudLevel} level (${Math.round(maxFraud * 100)}%). Immediate underwriting action required for ${topLines[0].line} and ${topLines[1]?.line ?? "n/a"}.`,
    total_estimated_impact_pct: Math.round(totalImpact),
  };
}
