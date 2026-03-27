/* ── Financial Impact Model ──
   Deterministic loss-range estimation from engine outputs.
   Every dollar figure is traceable to propagation severity,
   insurance exposure, and signal strength. No invented numbers.

   Core Formula:
   EstimatedLossRange =
     PortfolioExposureBase
     × SignalSeverityModifier
     × PropagationImpactModifier
     × InsurancePressureModifier
     × TimeWindowModifier

   All outputs are ranges (min–max), never single-point precision theater. */

import type { SignalSummary } from "@/lib/engine/signals";
import type { PropagationResult } from "@/lib/engine/propagation";
import type { DecisionClarityResult, ExposedLine } from "@/lib/decision/decisionClarity";
import type { InsuranceVisualizationResult } from "@/lib/insurance/insuranceVisualization";

/* ── Output Types ── */

export type LossUrgency = "immediate" | "short_term" | "medium_term";

export interface LossCategory {
  category: string;
  categoryKey: string;
  minLoss: number;       // USD
  maxLoss: number;       // USD
  driver: string;
  urgency: LossUrgency;
}

export interface ScenarioComparison {
  baselineRisk: number;
  activeRisk: number;
  riskDelta: number;
  baselineLoss: number;
  activeLossMin: number;
  activeLossMax: number;
  lossDelta: number;
  baselineDecision: string;
  activeDecision: string;
}

export interface FinancialImpactResult {
  totalEstimatedLossMin: number;
  totalEstimatedLossMax: number;
  timeWindow: string;                 // e.g. "48h"
  lossBreakdown: LossCategory[];
  primaryLossDriver: string;
  exposureDelta: number;              // 0-1 shift from baseline
  doNothingCost: number;              // estimated max if no action
  doNothingNarrative: DoNothingEntry[];
  scenarioComparison: ScenarioComparison;
  confidenceBand: "narrow" | "moderate" | "wide";
}

export interface DoNothingEntry {
  text: { en: string; ar: string };
  urgency: LossUrgency;
}

/* ── Portfolio Exposure Baselines ──
   Reference portfolio size for a mid-tier GCC insurer.
   These are NOT real policy values — they represent the baseline
   against which modifier percentages are applied. */

const PORTFOLIO_BASE: Record<string, number> = {
  travel:           4_500_000,   // $4.5M travel portfolio exposure
  marine_cargo:     8_000_000,   // $8M marine/cargo exposure
  energy:          12_000_000,   // $12M energy portfolio
  motor:            6_000_000,   // $6M motor
  property:         7_000_000,   // $7M property
  health:           5_000_000,   // $5M health
  liability:        4_000_000,   // $4M liability
  credit_trade:     6_000_000,   // $6M credit & trade
  life:             3_000_000,   // $3M life
  takaful:          3_500_000,   // $3.5M takaful
};

/* ── Modifier Functions ──
   Each modifier scales the base exposure into a loss estimate.
   Documented inline for audit trail. */

/**
 * Signal severity modifier: how strong are the incoming signals?
 * Range: 0.02 (weak signals) → 0.25 (critical multi-source confirmation)
 *
 * Formula: base 0.02 + (avgSeverity × 0.08) + (compositeScore × 0.06)
 *          + multi-source bonus (0.04 if 3+ source types)
 *          + signal volume bonus (0.03 if 4+ signals)
 */
function signalSeverityModifier(signals: SignalSummary): number {
  const base = 0.02;
  const severityContrib = signals.avgSeverity * 0.08;
  const compositeContrib = signals.compositeScore * 0.06;
  const sourceTypeBonus = Object.keys(signals.byType).length >= 3 ? 0.04 : 0;
  const volumeBonus = signals.totalSignals >= 4 ? 0.03 : 0;
  return Math.min(0.25, base + severityContrib + compositeContrib + sourceTypeBonus + volumeBonus);
}

/**
 * Propagation impact modifier: how far has disruption spread?
 * Range: 1.0 (minimal spread) → 3.0 (deep multi-level cascade)
 *
 * Formula: 1.0 + (maxDepth × 0.3) + (affectedNodeRatio × 1.5)
 *          + high-impact bonus (0.3 per node with impact > 0.7)
 */
function propagationImpactModifier(propagation: PropagationResult): number {
  const base = 1.0;
  const depthContrib = propagation.maxDepth * 0.3;

  // Ratio of high-impact nodes to total
  const highImpactNodes = propagation.affectedNodes.filter((n) => n.impactScore > 0.5).length;
  const nodeRatioContrib = (highImpactNodes / Math.max(propagation.affectedNodes.length, 1)) * 1.5;

  const criticalNodes = propagation.affectedNodes.filter((n) => n.impactScore > 0.7).length;
  const criticalBonus = Math.min(criticalNodes * 0.15, 0.6);

  return Math.min(3.0, base + depthContrib + nodeRatioContrib + criticalBonus);
}

/**
 * Insurance pressure modifier: how stressed is the insurance portfolio?
 * Range: 1.0 (normal posture) → 2.5 (emergency posture)
 *
 * Uses portfolio pressure, fraud pressure, and underwriting state.
 */
function insurancePressureModifier(insViz: InsuranceVisualizationResult): number {
  const base = 1.0;
  const portfolioContrib = insViz.portfolioPressure * 0.8;
  const fraudContrib = insViz.fraudPressure * 0.4;

  const postureBonus =
    insViz.underwritingState === "cease" ? 0.5
    : insViz.underwritingState === "restrict" ? 0.3
    : insViz.underwritingState === "tighten" ? 0.15
    : 0;

  return Math.min(2.5, base + portfolioContrib + fraudContrib + postureBonus);
}

/**
 * Time window modifier: how much time are we estimating over?
 * 48h default window.
 * Shorter windows reduce estimate; longer windows increase it.
 */
function timeWindowModifier(hoursElapsed: number): number {
  if (hoursElapsed <= 12) return 0.4;
  if (hoursElapsed <= 24) return 0.7;
  if (hoursElapsed <= 48) return 1.0;
  return 1.2;
}

/**
 * Inaction amplifier: how much worse does it get if we do nothing?
 * Range: 1.2 (low-severity) → 2.0 (emergency with cascade)
 */
function inactionAmplifier(clarity: DecisionClarityResult, propagation: PropagationResult): number {
  const base = 1.2;
  const riskContrib = clarity.finalRisk * 0.4;
  const cascadeContrib = Math.min(propagation.maxDepth * 0.1, 0.3);
  return Math.min(2.0, base + riskContrib + cascadeContrib);
}

/* ── Category-Specific Loss Estimation ── */

interface CategoryCalcInput {
  signals: SignalSummary;
  propagation: PropagationResult;
  clarity: DecisionClarityResult;
  insViz: InsuranceVisualizationResult;
  timeMod: number;
}

function computeTravelClaimsLoss(input: CategoryCalcInput): LossCategory | null {
  // Travel loss = travel base × signal severity × airport cascade severity × time
  const travelLine = input.clarity.topExposedLines.find((l) => l.line === "travel");
  if (!travelLine && input.propagation.affectedNodes.filter((n) => n.sector === "aviation").length === 0) return null;

  const exposureScore = travelLine?.exposureScore ?? 0;
  const airportNodes = input.propagation.affectedNodes.filter((n) => n.sector === "aviation");
  const avgAirportImpact = airportNodes.length > 0
    ? airportNodes.reduce((s, n) => s + n.impactScore, 0) / airportNodes.length
    : 0;

  const base = PORTFOLIO_BASE.travel;
  const severity = signalSeverityModifier(input.signals);
  const propMod = 1.0 + avgAirportImpact * 1.5;  // Airport cascade amplifies travel claims
  const insMod = 1.0 + (exposureScore / 100) * 0.5;

  const midEstimate = base * severity * propMod * insMod * input.timeMod;
  const minLoss = Math.round(midEstimate * 0.6);
  const maxLoss = Math.round(midEstimate * 1.4);

  return {
    category: "Travel Claims",
    categoryKey: "travel_claims",
    minLoss,
    maxLoss,
    driver: `${airportNodes.length} airports disrupted, avg impact ${Math.round(avgAirportImpact * 100)}%`,
    urgency: "immediate",
  };
}

function computeMarineCargoLoss(input: CategoryCalcInput): LossCategory | null {
  const marineLine = input.clarity.topExposedLines.find((l) => l.line === "marine_cargo");
  const maritimeNodes = input.propagation.affectedNodes.filter((n) => n.sector === "maritime");
  if (!marineLine && maritimeNodes.length === 0) return null;

  const exposureScore = marineLine?.exposureScore ?? 0;
  const chokepointNodes = input.propagation.affectedNodes.filter(
    (n) => n.sector === "maritime" && n.impactScore > 0.5
  );

  const base = PORTFOLIO_BASE.marine_cargo;
  const severity = signalSeverityModifier(input.signals);
  const propMod = 1.0 + chokepointNodes.length * 0.4;  // Each disrupted chokepoint amplifies
  const insMod = 1.0 + (exposureScore / 100) * 0.6;

  const midEstimate = base * severity * propMod * insMod * input.timeMod;
  const minLoss = Math.round(midEstimate * 0.5);
  const maxLoss = Math.round(midEstimate * 1.5);

  return {
    category: "Marine & Cargo Disruption",
    categoryKey: "marine_cargo",
    minLoss,
    maxLoss,
    driver: `${chokepointNodes.length} chokepoints stressed, route exposure ${exposureScore}%`,
    urgency: "short_term",
  };
}

function computeUnderwritingDeterioration(input: CategoryCalcInput): LossCategory | null {
  if (input.insViz.underwritingState === "normal") return null;

  const elevatedLines = input.clarity.topExposedLines.filter((l) => l.exposureScore > 20);
  const totalExposure = elevatedLines.reduce((s, l) => s + l.exposureScore, 0);

  // Sum of all exposed line base portfolios × deterioration factor
  const exposedBase = elevatedLines.reduce((s, l) => {
    const key = l.line as keyof typeof PORTFOLIO_BASE;
    return s + (PORTFOLIO_BASE[key] ?? 3_000_000);
  }, 0);

  const deteriorationFactor =
    input.insViz.underwritingState === "cease" ? 0.08
    : input.insViz.underwritingState === "restrict" ? 0.05
    : 0.025;  // tighten

  const midEstimate = exposedBase * deteriorationFactor * input.timeMod;
  const minLoss = Math.round(midEstimate * 0.7);
  const maxLoss = Math.round(midEstimate * 1.3);

  return {
    category: "Underwriting Deterioration",
    categoryKey: "underwriting",
    minLoss,
    maxLoss,
    driver: `${elevatedLines.length} lines elevated, total exposure ${Math.round(totalExposure)}%`,
    urgency: "medium_term",
  };
}

function computeFraudExposure(input: CategoryCalcInput): LossCategory | null {
  if (input.insViz.fraudPressure < 0.15) return null;

  const fraudLines = input.clarity.topExposedLines.filter((l) => l.fraudUplift > 0.1);
  const avgFraudUplift = fraudLines.length > 0
    ? fraudLines.reduce((s, l) => s + l.fraudUplift, 0) / fraudLines.length
    : input.insViz.fraudPressure;

  // Fraud exposure = total portfolio × fraud pressure × fraud uplift × time
  const totalPortfolio = Object.values(PORTFOLIO_BASE).reduce((s, v) => s + v, 0);
  const midEstimate = totalPortfolio * 0.01 * avgFraudUplift * input.insViz.fraudPressure * input.timeMod;

  const minLoss = Math.round(midEstimate * 0.5);
  const maxLoss = Math.round(midEstimate * 2.0);  // Wide band — fraud is uncertain

  return {
    category: "Fraud Exposure",
    categoryKey: "fraud",
    minLoss,
    maxLoss,
    driver: `Fraud pressure ${Math.round(input.insViz.fraudPressure * 100)}%, avg uplift +${Math.round(avgFraudUplift * 100)}%`,
    urgency: "short_term",
  };
}

function computeOperationalSurgeCost(input: CategoryCalcInput): LossCategory | null {
  const affectedCount = input.clarity.affectedEntities.length;
  if (affectedCount < 3) return null;

  // Surge cost scales with entity count and claims posture
  const claimsMultiplier =
    input.insViz.claimsState === "emergency" ? 3.0
    : input.insViz.claimsState === "surge_prepare" ? 2.0
    : input.insViz.claimsState === "monitor" ? 1.3
    : 1.0;

  // Base: $15K per affected entity for claims handling surge
  const midEstimate = affectedCount * 15_000 * claimsMultiplier * input.timeMod;
  const minLoss = Math.round(midEstimate * 0.6);
  const maxLoss = Math.round(midEstimate * 1.4);

  return {
    category: "Operational Surge Cost",
    categoryKey: "operations",
    minLoss,
    maxLoss,
    driver: `${affectedCount} entities, claims posture: ${input.insViz.claimsState}`,
    urgency: "immediate",
  };
}

function computeMarketLiquidityPressure(input: CategoryCalcInput): LossCategory | null {
  const financeNodes = input.propagation.affectedNodes.filter((n) => n.sector === "finance");
  if (financeNodes.length === 0) return null;

  const avgFinImpact = financeNodes.reduce((s, n) => s + n.impactScore, 0) / financeNodes.length;
  if (avgFinImpact < 0.2) return null;

  const creditLine = input.clarity.topExposedLines.find((l) => l.line === "credit_trade");
  const exposureScore = creditLine?.exposureScore ?? 0;

  const base = PORTFOLIO_BASE.credit_trade;
  const midEstimate = base * avgFinImpact * 0.15 * input.timeMod;
  const minLoss = Math.round(midEstimate * 0.4);
  const maxLoss = Math.round(midEstimate * 1.6);

  return {
    category: "Market & Liquidity Pressure",
    categoryKey: "market",
    minLoss,
    maxLoss,
    driver: `${financeNodes.length} financial nodes, avg impact ${Math.round(avgFinImpact * 100)}%`,
    urgency: "medium_term",
  };
}

/* ── Do-Nothing Narrative Builder ── */

function buildDoNothingNarrative(
  clarity: DecisionClarityResult,
  insViz: InsuranceVisualizationResult,
  propagation: PropagationResult
): DoNothingEntry[] {
  const entries: DoNothingEntry[] = [];

  // Claims surge
  if (insViz.claimsState !== "normal") {
    entries.push({
      text: {
        en: "Claims surge likely within 24\u201348h",
        ar: "\u0627\u0631\u062a\u0641\u0627\u0639 \u0627\u0644\u0645\u0637\u0627\u0644\u0628\u0627\u062a \u0645\u062a\u0648\u0642\u0639 \u062e\u0644\u0627\u0644 24-48 \u0633\u0627\u0639\u0629",
      },
      urgency: "immediate",
    });
  }

  // Cargo interruption
  const maritimeNodes = propagation.affectedNodes.filter((n) => n.sector === "maritime");
  if (maritimeNodes.length > 0) {
    entries.push({
      text: {
        en: "Cargo interruption costs likely to expand",
        ar: "\u062a\u0643\u0627\u0644\u064a\u0641 \u0627\u0646\u0642\u0637\u0627\u0639 \u0627\u0644\u0634\u062d\u0646 \u0645\u0631\u062c\u062d\u0629 \u0644\u0644\u062a\u0648\u0633\u0639",
      },
      urgency: "short_term",
    });
  }

  // Fraud pressure
  if (insViz.fraudPressure > 0.2) {
    entries.push({
      text: {
        en: "Fraud pressure likely to intensify in impacted corridor",
        ar: "\u0636\u063a\u0637 \u0627\u0644\u0627\u062d\u062a\u064a\u0627\u0644 \u0645\u0631\u062c\u062d \u0644\u0644\u062a\u0635\u0627\u0639\u062f \u0641\u064a \u0627\u0644\u0645\u0645\u0631 \u0627\u0644\u0645\u062a\u0623\u062b\u0631",
      },
      urgency: "short_term",
    });
  }

  // Underwriting deterioration
  if (insViz.underwritingState !== "normal") {
    entries.push({
      text: {
        en: "Underwriting deterioration likely if pricing remains unchanged",
        ar: "\u062a\u062f\u0647\u0648\u0631 \u0627\u0644\u0627\u0643\u062a\u062a\u0627\u0628 \u0645\u062a\u0648\u0642\u0639 \u0625\u0630\u0627 \u0644\u0645 \u064a\u062a\u063a\u064a\u0631 \u0627\u0644\u062a\u0633\u0639\u064a\u0631",
      },
      urgency: "medium_term",
    });
  }

  // Cascade expansion
  if (propagation.maxDepth >= 3) {
    entries.push({
      text: {
        en: "Cascade likely to reach additional sectors within 48\u201372h",
        ar: "\u0627\u0644\u062a\u062a\u0627\u0628\u0639 \u0645\u0631\u062c\u062d \u0644\u0644\u0648\u0635\u0648\u0644 \u0625\u0644\u0649 \u0642\u0637\u0627\u0639\u0627\u062a \u0625\u0636\u0627\u0641\u064a\u0629 \u062e\u0644\u0627\u0644 48-72 \u0633\u0627\u0639\u0629",
      },
      urgency: "medium_term",
    });
  }

  return entries;
}

/* ── Main Computation ── */

export function computeFinancialImpact(
  signals: SignalSummary,
  propagation: PropagationResult,
  insViz: InsuranceVisualizationResult,
  clarity: DecisionClarityResult
): FinancialImpactResult {
  const timeMod = timeWindowModifier(48); // Standard 48h window

  const calcInput: CategoryCalcInput = {
    signals,
    propagation,
    clarity,
    insViz,
    timeMod,
  };

  // Compute each loss category
  const categories: LossCategory[] = [
    computeTravelClaimsLoss(calcInput),
    computeMarineCargoLoss(calcInput),
    computeUnderwritingDeterioration(calcInput),
    computeFraudExposure(calcInput),
    computeOperationalSurgeCost(calcInput),
    computeMarketLiquidityPressure(calcInput),
  ].filter((c): c is LossCategory => c !== null);

  // Sort by maxLoss descending
  categories.sort((a, b) => b.maxLoss - a.maxLoss);

  // Totals
  const totalMin = categories.reduce((s, c) => s + c.minLoss, 0);
  const totalMax = categories.reduce((s, c) => s + c.maxLoss, 0);

  // Primary driver = category with highest max loss
  const primaryDriver = categories[0]?.category ?? "No significant loss drivers identified";

  // Exposure delta = shift from baseline (baseline is 0 risk → current risk)
  const exposureDelta = clarity.finalRisk - clarity.baselineRisk;

  // Do-nothing cost = total max × inaction amplifier
  const amplifier = inactionAmplifier(clarity, propagation);
  const doNothingCost = Math.round(totalMax * amplifier);

  // Do-nothing narrative
  const doNothingNarrative = buildDoNothingNarrative(clarity, insViz, propagation);

  // Scenario comparison
  const baselineLoss = Math.round(totalMin * 0.3); // Baseline = ~30% of min disruption estimate
  const scenarioComparison: ScenarioComparison = {
    baselineRisk: Math.round(clarity.baselineRisk * 100),
    activeRisk: Math.round(clarity.finalRisk * 100),
    riskDelta: Math.round((clarity.finalRisk - clarity.baselineRisk) * 100),
    baselineLoss,
    activeLossMin: totalMin,
    activeLossMax: totalMax,
    lossDelta: totalMax - baselineLoss,
    baselineDecision: "hold",
    activeDecision: clarity.decisionState,
  };

  // Confidence band width
  const range = totalMax > 0 ? (totalMax - totalMin) / totalMax : 0;
  const confidenceBand: FinancialImpactResult["confidenceBand"] =
    range < 0.3 ? "narrow"
    : range < 0.55 ? "moderate"
    : "wide";

  return {
    totalEstimatedLossMin: totalMin,
    totalEstimatedLossMax: totalMax,
    timeWindow: "48h",
    lossBreakdown: categories,
    primaryLossDriver: primaryDriver,
    exposureDelta,
    doNothingCost,
    doNothingNarrative,
    scenarioComparison,
    confidenceBand,
  };
}

/* ── Format Helpers ── */

export function formatUSD(amount: number): string {
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`;
  return `$${amount}`;
}

export function formatLossRange(min: number, max: number): string {
  return `${formatUSD(min)} \u2013 ${formatUSD(max)}`;
}
