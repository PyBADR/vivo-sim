/* ── Decision Clarity Model ──
   Deterministic presentation layer for decision explanation.
   Consumes real engine outputs, produces ranked explanations.

   Every word comes from actual data. No generic summaries.
   No random wording. Fully traceable to engine state. */

import type { PropagationResult, NodeImpactResult } from "@/lib/engine/propagation";
import type { InsuranceExposureResult, LineExposure, InsuranceLine } from "@/lib/engine/insurance";
import type { DecisionOutput, RiskComponents } from "@/lib/engine/decisionEngine";
import type { SignalSummary } from "@/lib/engine/signals";

/* ── Decision Driver ── */

export interface DecisionDriver {
  id: string;
  label: { en: string; ar: string };
  contribution: number;        // Absolute risk contribution (0-100 scale)
  component: keyof RiskComponents;
  detail: { en: string; ar: string };
}

/* ── Recommended Action ── */

export type ActionCategory = "underwriting" | "claims" | "fraud" | "operations";

export interface RecommendedAction {
  id: string;
  category: ActionCategory;
  action: string;
  urgency: "immediate" | "short_term" | "medium_term";
  sourceLine?: InsuranceLine;
}

/* ── Affected Entity ── */

export interface AffectedEntity {
  id: string;
  label: string;
  impact: number;
  sector: string;
  country: string;
  role: string;  // e.g. "Primary source", "Cascade target", "Chokepoint"
}

/* ── Exposed Insurance Line ── */

export interface ExposedLine {
  line: InsuranceLine;
  displayName: { en: string; ar: string };
  exposureScore: number;
  severityUplift: number;
  frequencyUplift: number;
  fraudUplift: number;
  urgency: "critical" | "elevated" | "rising" | "stable";
  underwritingAction: string;
  claimsAction: string;
}

/* ── Full Clarity Output ── */

export interface DecisionClarityResult {
  /* Risk Decomposition */
  baselineRisk: number;
  externalSignalModifier: number;
  propagationContribution: number;
  insuranceContribution: number;
  finalRisk: number;

  /* Decision */
  decisionState: DecisionOutput["decision"];
  confidence: number;
  executiveInterpretation: { en: string; ar: string };
  decisionDeadline: string;
  financialImpact: string;

  /* Explanation */
  topDecisionDrivers: DecisionDriver[];
  recommendedActions: RecommendedAction[];
  affectedEntities: AffectedEntity[];
  topExposedLines: ExposedLine[];

  /* Insurance Summary */
  portfolioPressure: number;
  fraudEscalationRisk: number;
  underwritingPosture: "normal" | "tighten" | "restrict" | "cease";
  claimsPosture: "normal" | "monitor" | "surge_prepare" | "emergency";
}

/* ── Line Display Names ── */

const LINE_NAMES: Record<InsuranceLine, { en: string; ar: string }> = {
  motor:        { en: "Motor", ar: "تأمين المركبات" },
  health:       { en: "Health", ar: "التأمين الصحي" },
  travel:       { en: "Travel", ar: "تأمين السفر" },
  marine_cargo: { en: "Marine & Cargo", ar: "التأمين البحري والشحن" },
  property:     { en: "Property", ar: "تأمين الممتلكات" },
  liability:    { en: "Liability", ar: "تأمين المسؤولية" },
  energy:       { en: "Energy", ar: "تأمين الطاقة" },
  credit_trade: { en: "Credit & Trade", ar: "تأمين الائتمان والتجارة" },
  life:         { en: "Life", ar: "تأمين الحياة" },
  takaful:      { en: "Takaful", ar: "التكافل" },
};

/* ── Compute Decision Clarity ── */

export function computeDecisionClarity(
  signalSummary: SignalSummary,
  propagation: PropagationResult,
  insurance: InsuranceExposureResult,
  decision: DecisionOutput
): DecisionClarityResult {
  // Risk decomposition
  const baselineRisk = decision.riskScore;
  const externalSignalModifier = decision.adjustedRisk - decision.riskScore;
  const propagationContribution = propagation.affectedNodes.length > 0
    ? (propagation.totalEnergy / propagation.affectedNodes.length) * 0.20
    : 0;
  const insuranceContribution = (insurance.total_estimated_impact_pct / 100) * 0.20;

  // Build decision drivers from actual risk components
  const drivers: DecisionDriver[] = [];

  // Geopolitical driver
  const geoScore = Math.min(signalSummary.avgSeverity * 1.2, 1);
  if (geoScore > 0.1) {
    const topSignal = signalSummary.topSignals[0];
    drivers.push({
      id: "geo",
      label: {
        en: topSignal?.title ?? "Regional geopolitical escalation",
        ar: topSignal?.title ?? "تصعيد جيوسياسي إقليمي",
      },
      contribution: Math.round(geoScore * 25), // 25% weight
      component: "geopolitical",
      detail: {
        en: `Signal severity ${Math.round(signalSummary.avgSeverity * 100)}% across ${signalSummary.totalSignals} signals`,
        ar: `شدة الإشارة ${Math.round(signalSummary.avgSeverity * 100)}% عبر ${signalSummary.totalSignals} إشارات`,
      },
    });
  }

  // Propagation driver
  const avgPropImpact = propagation.affectedNodes.length > 0
    ? propagation.totalEnergy / propagation.affectedNodes.length
    : 0;
  if (avgPropImpact > 0.05) {
    const topNode = propagation.topVulnerabilities[0];
    drivers.push({
      id: "propagation",
      label: {
        en: `${propagation.affectedNodes.length}-node cascade via ${topNode?.label ?? "unknown"}`,
        ar: `تأثير متتالي عبر ${propagation.affectedNodes.length} عقدة من ${topNode?.label ?? "غير معروف"}`,
      },
      contribution: Math.round(avgPropImpact * 20),
      component: "propagation",
      detail: {
        en: `${propagation.maxDepth} cascade levels, ${Math.round(propagation.totalEnergy * 100) / 100} total energy`,
        ar: `${propagation.maxDepth} مستويات تتابعية، طاقة إجمالية ${Math.round(propagation.totalEnergy * 100) / 100}`,
      },
    });
  }

  // Exposure driver (insurance)
  const exposureScore = Math.min(insurance.total_estimated_impact_pct / 100, 1);
  if (exposureScore > 0.05) {
    const topLine = insurance.lines[0];
    drivers.push({
      id: "exposure",
      label: {
        en: `${topLine?.line ?? "Insurance"} exposure at ${topLine?.estimatedImpactPct ?? 0}%`,
        ar: `انكشاف ${LINE_NAMES[topLine?.line as InsuranceLine]?.ar ?? "التأمين"} عند ${topLine?.estimatedImpactPct ?? 0}%`,
      },
      contribution: Math.round(exposureScore * 20),
      component: "exposure",
      detail: {
        en: `Portfolio impact ${insurance.total_estimated_impact_pct}%, fraud level: ${insurance.fraud_alert_level}`,
        ar: `تأثير المحفظة ${insurance.total_estimated_impact_pct}%، مستوى الاحتيال: ${insurance.fraud_alert_level}`,
      },
    });
  }

  // Economic driver
  const econScore = Math.min(insurance.total_estimated_impact_pct / 100, 1);
  if (econScore > 0.1) {
    drivers.push({
      id: "economic",
      label: {
        en: `Estimated systemic impact ${decision.financial_impact.estimated_loss_range}`,
        ar: `الأثر النظامي التقديري ${decision.financial_impact.estimated_loss_range}`,
      },
      contribution: Math.round(econScore * 20),
      component: "economic",
      detail: {
        en: `${decision.financial_impact.sectors_affected.length} sectors affected`,
        ar: `${decision.financial_impact.sectors_affected.length} قطاعات متأثرة`,
      },
    });
  }

  // Behavioral driver
  const behavioralScore = Math.min(signalSummary.compositeScore, 1);
  if (behavioralScore > 0.1) {
    drivers.push({
      id: "behavioral",
      label: {
        en: `Cross-source confirmation at ${Math.round(behavioralScore * 100)}%`,
        ar: `تأكيد متعدد المصادر عند ${Math.round(behavioralScore * 100)}%`,
      },
      contribution: Math.round(behavioralScore * 15),
      component: "behavioral",
      detail: {
        en: `${signalSummary.totalSignals} signals from ${Object.keys(signalSummary.byType).length} source types`,
        ar: `${signalSummary.totalSignals} إشارة من ${Object.keys(signalSummary.byType).length} أنواع مصادر`,
      },
    });
  }

  // Sort by contribution descending
  drivers.sort((a, b) => b.contribution - a.contribution);

  // Build recommended actions from real insurance engine output
  const actions: RecommendedAction[] = [];
  let actionId = 0;

  for (const line of insurance.lines.slice(0, 4)) {
    if (line.estimatedImpactPct > 10) {
      actions.push({
        id: `uw-${actionId++}`,
        category: "underwriting",
        action: line.underwritingAction,
        urgency: line.estimatedImpactPct > 40 ? "immediate" : "short_term",
        sourceLine: line.line,
      });
    }
  }

  for (const line of insurance.lines.slice(0, 3)) {
    if (line.estimatedImpactPct > 15) {
      actions.push({
        id: `cl-${actionId++}`,
        category: "claims",
        action: line.claimsAction,
        urgency: line.estimatedImpactPct > 40 ? "immediate" : "short_term",
        sourceLine: line.line,
      });
    }
  }

  // Fraud actions if elevated
  if (insurance.fraud_alert_level !== "low") {
    actions.push({
      id: `fr-${actionId++}`,
      category: "fraud",
      action: `Activate fraud surveillance for ${insurance.lines[0]?.line ?? "top exposure"} claims — ${insurance.fraud_alert_level} alert`,
      urgency: insurance.fraud_alert_level === "critical" ? "immediate" : "short_term",
    });
    actions.push({
      id: `fr-${actionId++}`,
      category: "fraud",
      action: `Flag opportunistic claims in ${insurance.lines.filter(l => l.fraudUplift > 0.3).map(l => l.line).join(", ")}`,
      urgency: "short_term",
    });
  }

  // Operational actions
  actions.push({
    id: `ops-${actionId++}`,
    category: "operations",
    action: `Deploy surge capacity for ${propagation.affectedNodes.length} affected entities across ${new Set(propagation.affectedNodes.map(n => n.sector)).size} sectors`,
    urgency: decision.decision === "emergency_protocol" ? "immediate" : "short_term",
  });

  // Affected entities
  const entities: AffectedEntity[] = propagation.topVulnerabilities.slice(0, 7).map((n, i) => ({
    id: n.nodeId,
    label: n.label,
    impact: n.impactScore,
    sector: n.sector,
    country: n.country,
    role: i === 0 ? "Primary source" : n.depth <= 1 ? "Direct dependency" : n.depth <= 2 ? "Cascade target" : "Extended network",
  }));

  // Exposed lines
  const exposedLines: ExposedLine[] = insurance.lines
    .filter((l) => l.estimatedImpactPct > 5)
    .slice(0, 6)
    .map((l) => ({
      line: l.line,
      displayName: LINE_NAMES[l.line] ?? { en: l.line, ar: l.line },
      exposureScore: l.estimatedImpactPct,
      severityUplift: l.severityUplift,
      frequencyUplift: l.frequencyUplift,
      fraudUplift: l.fraudUplift,
      urgency: l.estimatedImpactPct >= 40 ? "critical" as const
        : l.estimatedImpactPct >= 25 ? "elevated" as const
        : l.estimatedImpactPct >= 10 ? "rising" as const
        : "stable" as const,
      underwritingAction: l.underwritingAction,
      claimsAction: l.claimsAction,
    }));

  // Insurance postures
  const maxExposure = insurance.lines.length > 0 ? insurance.lines[0].estimatedImpactPct : 0;
  const underwritingPosture: DecisionClarityResult["underwritingPosture"] =
    maxExposure >= 50 ? "cease" : maxExposure >= 30 ? "restrict" : maxExposure >= 15 ? "tighten" : "normal";

  const claimsPosture: DecisionClarityResult["claimsPosture"] =
    decision.decision === "emergency_protocol" ? "emergency"
    : maxExposure >= 30 ? "surge_prepare"
    : maxExposure >= 15 ? "monitor"
    : "normal";

  const maxFraud = insurance.lines.length > 0 ? Math.max(...insurance.lines.map(l => l.fraudUplift)) : 0;

  // Executive interpretation
  const execEn = buildExecutiveInterpretation(decision, propagation, insurance, "en");
  const execAr = buildExecutiveInterpretation(decision, propagation, insurance, "ar");

  return {
    baselineRisk,
    externalSignalModifier: Math.round(externalSignalModifier * 100) / 100,
    propagationContribution: Math.round(propagationContribution * 100) / 100,
    insuranceContribution: Math.round(insuranceContribution * 100) / 100,
    finalRisk: decision.adjustedRisk,
    decisionState: decision.decision,
    confidence: decision.confidence,
    executiveInterpretation: { en: execEn, ar: execAr },
    decisionDeadline: decision.decision_deadline,
    financialImpact: decision.financial_impact.estimated_loss_range,
    topDecisionDrivers: drivers,
    recommendedActions: actions,
    affectedEntities: entities,
    topExposedLines: exposedLines,
    portfolioPressure: insurance.total_estimated_impact_pct / 100,
    fraudEscalationRisk: maxFraud,
    underwritingPosture,
    claimsPosture,
  };
}

/* ── Executive Interpretation Builder ── */

function buildExecutiveInterpretation(
  decision: DecisionOutput,
  propagation: PropagationResult,
  insurance: InsuranceExposureResult,
  lang: "en" | "ar"
): string {
  const riskPct = Math.round(decision.adjustedRisk * 100);
  const topNode = propagation.topVulnerabilities[0];
  const topLine = insurance.lines[0];

  if (lang === "ar") {
    switch (decision.decision) {
      case "emergency_protocol":
        return `مخاطر حرجة عند ${riskPct}%. ${propagation.affectedNodes.length} جهة متأثرة. يتطلب بروتوكول طوارئ فوري.`;
      case "activate_response":
        return `مخاطر مرتفعة عند ${riskPct}%. تأثير متتالي يصل إلى ${topNode?.label ?? "بنية تحتية حرجة"}. تفعيل الاستجابة.`;
      case "escalate":
        return `تصعيد المخاطر عند ${riskPct}%. انكشاف ${topLine?.line ?? "متعدد"} يتطلب تقييماً عاجلاً.`;
      default:
        return `مستوى المخاطر مستقر عند ${riskPct}%. المراقبة مستمرة.`;
    }
  }

  switch (decision.decision) {
    case "emergency_protocol":
      return `Critical risk at ${riskPct}%. ${propagation.affectedNodes.length} entities impacted. Immediate emergency protocol required.`;
    case "activate_response":
      return `Elevated risk at ${riskPct}%. Cascade reaches ${topNode?.label ?? "critical infrastructure"}. Activate response.`;
    case "escalate":
      return `Risk escalating at ${riskPct}%. ${topLine?.line ?? "Multiple"} exposure requires urgent assessment.`;
    default:
      return `Risk level stable at ${riskPct}%. Monitoring continues.`;
  }
}
