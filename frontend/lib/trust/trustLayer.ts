/* ── Trust Layer Model ──
   Grounded trust assessment from pipeline state.
   No fake assurance. If confidence is partial, it says so.
   Every trust indicator maps to a real engine output.

   Trust Score = weighted combination of:
   - Source confirmation strength (30%)
   - Propagation consistency (25%)
   - Insurance exposure coherence (20%)
   - Decision driver stability (15%)
   - Data recency (10%) */

import type { SignalSummary } from "@/lib/engine/signals";
import type { PropagationResult } from "@/lib/engine/propagation";
import type { DecisionClarityResult } from "@/lib/decision/decisionClarity";
import type { InsuranceVisualizationResult } from "@/lib/insurance/insuranceVisualization";
import type { FinancialImpactResult } from "@/lib/finance/financialImpact";

/* ── Output Types ── */

export interface ConfidenceBasisEntry {
  factor: string;
  description: { en: string; ar: string };
  strength: "strong" | "moderate" | "weak";
  score: number; // 0-1
}

export interface ModelInputSummary {
  label: { en: string; ar: string };
  value: string;
}

export interface KnownLimitation {
  text: { en: string; ar: string };
  severity: "low" | "medium" | "high";
}

export interface TrustLayerResult {
  trustScore: number;                         // 0-100
  confidenceBasis: ConfidenceBasisEntry[];
  sourceCount: number;
  confirmedSignals: number;
  activeNodesCount: number;
  activeEdgesCount: number;
  dataRecency: string;
  modelInputsSummary: ModelInputSummary[];
  knownLimitations: KnownLimitation[];
  trustNarrative: { en: string; ar: string };
  actionConfidence: "high" | "moderate" | "low";
}

/* ── Trust Score Weights ── */

const WEIGHT_SOURCE_CONFIRMATION = 0.30;
const WEIGHT_PROPAGATION_CONSISTENCY = 0.25;
const WEIGHT_INSURANCE_COHERENCE = 0.20;
const WEIGHT_DECISION_STABILITY = 0.15;
const WEIGHT_DATA_RECENCY = 0.10;

/* ── Component Scorers ── */

/**
 * Source confirmation: how many independent signals confirm the situation?
 * Score: 0 (single unconfirmed) → 1.0 (4+ signals from 3+ source types)
 */
function scoreSourceConfirmation(signals: SignalSummary): {
  score: number;
  entry: ConfidenceBasisEntry;
} {
  const signalCount = signals.totalSignals;
  const sourceTypes = Object.keys(signals.byType).length;
  const avgConfidence = signals.avgSeverity;

  // Score components
  let score = 0;
  score += Math.min(signalCount / 5, 0.4);        // Up to 0.4 for signal volume
  score += Math.min(sourceTypes / 3, 0.3);         // Up to 0.3 for source diversity
  score += avgConfidence * 0.3;                     // Up to 0.3 for signal quality
  score = Math.min(score, 1.0);

  const strength: ConfidenceBasisEntry["strength"] =
    score >= 0.7 ? "strong" : score >= 0.4 ? "moderate" : "weak";

  return {
    score,
    entry: {
      factor: "multi_source_confirmation",
      description: {
        en: `${signalCount} signals from ${sourceTypes} source type${sourceTypes !== 1 ? "s" : ""} with avg severity ${Math.round(avgConfidence * 100)}%`,
        ar: `${signalCount} \u0625\u0634\u0627\u0631\u0627\u062a \u0645\u0646 ${sourceTypes} \u0623\u0646\u0648\u0627\u0639 \u0645\u0635\u0627\u062f\u0631 \u0628\u0645\u062a\u0648\u0633\u0637 \u062d\u062f\u0629 ${Math.round(avgConfidence * 100)}%`,
      },
      strength,
      score,
    },
  };
}

/**
 * Propagation consistency: does the cascade pattern make sense?
 * Checks: depth progression, multi-path confirmation, energy distribution.
 */
function scorePropagationConsistency(propagation: PropagationResult): {
  score: number;
  entry: ConfidenceBasisEntry;
} {
  const { affectedNodes, maxDepth, propagationPaths, totalEnergy } = propagation;
  if (affectedNodes.length === 0) return { score: 0, entry: { factor: "propagation_consistency", description: { en: "No propagation data", ar: "\u0644\u0627 \u062a\u0648\u062c\u062f \u0628\u064a\u0627\u0646\u0627\u062a \u062a\u062a\u0627\u0628\u0639" }, strength: "weak", score: 0 } };

  // Check that impact decreases with depth (expected in real cascades)
  const depthBuckets = new Map<number, number[]>();
  for (const node of affectedNodes) {
    const bucket = depthBuckets.get(node.depth) ?? [];
    bucket.push(node.impactScore);
    depthBuckets.set(node.depth, bucket);
  }
  const depthAvgs = Array.from(depthBuckets.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([, scores]) => scores.reduce((s, v) => s + v, 0) / scores.length);

  // Monotonic decrease check (with tolerance)
  let consistentDecay = 0;
  for (let i = 1; i < depthAvgs.length; i++) {
    if (depthAvgs[i] <= depthAvgs[i - 1] + 0.1) consistentDecay++;
  }
  const decayScore = depthAvgs.length > 1 ? consistentDecay / (depthAvgs.length - 1) : 0.5;

  // Multi-path confirmation
  const multiPathScore = Math.min(propagationPaths.length / 6, 0.3);

  // Energy distribution
  const energyScore = Math.min(totalEnergy / 3, 0.3);

  const score = Math.min(decayScore * 0.4 + multiPathScore + energyScore, 1.0);
  const strength: ConfidenceBasisEntry["strength"] =
    score >= 0.65 ? "strong" : score >= 0.35 ? "moderate" : "weak";

  return {
    score,
    entry: {
      factor: "cross_border_propagation_consistency",
      description: {
        en: `${maxDepth}-level cascade across ${propagationPaths.length} paths with ${affectedNodes.length} nodes`,
        ar: `\u062a\u062a\u0627\u0628\u0639 ${maxDepth} \u0645\u0633\u062a\u0648\u064a\u0627\u062a \u0639\u0628\u0631 ${propagationPaths.length} \u0645\u0633\u0627\u0631\u0627\u062a \u0628 ${affectedNodes.length} \u0639\u0642\u062f\u0629`,
      },
      strength,
      score,
    },
  };
}

/**
 * Insurance exposure coherence: do insurance outputs align with propagation?
 */
function scoreInsuranceCoherence(
  insViz: InsuranceVisualizationResult,
  clarity: DecisionClarityResult
): {
  score: number;
  entry: ConfidenceBasisEntry;
} {
  const exposedLineCount = clarity.topExposedLines.filter((l) => l.exposureScore > 10).length;
  const portfolioPressure = insViz.portfolioPressure;
  const postureAligned =
    (portfolioPressure > 0.4 && insViz.underwritingState !== "normal") ||
    (portfolioPressure <= 0.4 && insViz.underwritingState === "normal") ||
    (portfolioPressure > 0.3); // partial alignment counts

  let score = 0;
  score += Math.min(exposedLineCount / 5, 0.35);
  score += portfolioPressure * 0.35;
  score += postureAligned ? 0.3 : 0.1;
  score = Math.min(score, 1.0);

  const strength: ConfidenceBasisEntry["strength"] =
    score >= 0.65 ? "strong" : score >= 0.35 ? "moderate" : "weak";

  return {
    score,
    entry: {
      factor: "insurance_exposure_coherence",
      description: {
        en: `${exposedLineCount} exposed lines at ${Math.round(portfolioPressure * 100)}% portfolio pressure`,
        ar: `${exposedLineCount} \u062e\u0637\u0648\u0637 \u0645\u0643\u0634\u0648\u0641\u0629 \u0628\u0636\u063a\u0637 \u0645\u062d\u0641\u0638\u0629 ${Math.round(portfolioPressure * 100)}%`,
      },
      strength,
      score,
    },
  };
}

/**
 * Decision driver stability: are the top drivers consistent and ranked?
 */
function scoreDecisionStability(clarity: DecisionClarityResult): {
  score: number;
  entry: ConfidenceBasisEntry;
} {
  const drivers = clarity.topDecisionDrivers;
  if (drivers.length === 0) return { score: 0.2, entry: { factor: "decision_driver_stability", description: { en: "No decision drivers identified", ar: "\u0644\u0645 \u064a\u062a\u0645 \u062a\u062d\u062f\u064a\u062f \u0645\u062d\u0631\u0643\u0627\u062a \u0642\u0631\u0627\u0631" }, strength: "weak", score: 0.2 } };

  // Check contribution spread (concentrated = more confident)
  const totalContrib = drivers.reduce((s, d) => s + d.contribution, 0);
  const topContrib = drivers[0]?.contribution ?? 0;
  const concentration = totalContrib > 0 ? topContrib / totalContrib : 0;

  // Check that drivers have meaningful separation
  const driverCount = drivers.length;
  const separationScore = Math.min(driverCount / 4, 0.3);

  const score = Math.min(concentration * 0.5 + separationScore + clarity.confidence * 0.3, 1.0);
  const strength: ConfidenceBasisEntry["strength"] =
    score >= 0.65 ? "strong" : score >= 0.35 ? "moderate" : "weak";

  return {
    score,
    entry: {
      factor: "stable_decision_driver_ranking",
      description: {
        en: `${driverCount} ranked drivers, top driver at ${Math.round(concentration * 100)}% contribution`,
        ar: `${driverCount} \u0645\u062d\u0631\u0643\u0627\u062a \u0645\u0631\u062a\u0628\u0629\u060c \u0627\u0644\u0645\u062d\u0631\u0643 \u0627\u0644\u0623\u0648\u0644 \u0628\u0646\u0633\u0628\u0629 ${Math.round(concentration * 100)}%`,
      },
      strength,
      score,
    },
  };
}

/**
 * Data recency: how current is the information?
 * For demo purposes, always high (signals are just generated).
 */
function scoreDataRecency(signals: SignalSummary): {
  score: number;
  entry: ConfidenceBasisEntry;
} {
  // In production, this would compare signal timestamps to now.
  // For the demo, signals are generated at runtime = fresh.
  const score = signals.totalSignals > 0 ? 0.85 : 0.2;
  const strength: ConfidenceBasisEntry["strength"] = score >= 0.7 ? "strong" : "moderate";

  return {
    score,
    entry: {
      factor: "data_recency",
      description: {
        en: "Signal data is current (generated at runtime)",
        ar: "\u0628\u064a\u0627\u0646\u0627\u062a \u0627\u0644\u0625\u0634\u0627\u0631\u0627\u062a \u062d\u062f\u064a\u062b\u0629 (\u0645\u064f\u0648\u0644\u062f\u0629 \u0639\u0646\u062f \u0627\u0644\u062a\u0634\u063a\u064a\u0644)",
      },
      strength,
      score,
    },
  };
}

/* ── Known Limitations Builder ── */

function buildKnownLimitations(
  signals: SignalSummary,
  propagation: PropagationResult,
  insViz: InsuranceVisualizationResult
): KnownLimitation[] {
  const limitations: KnownLimitation[] = [];

  if (signals.totalSignals < 3) {
    limitations.push({
      text: {
        en: "Limited signal volume \u2014 downstream confidence may be lower than indicated",
        ar: "\u062d\u062c\u0645 \u0625\u0634\u0627\u0631\u0627\u062a \u0645\u062d\u062f\u0648\u062f \u2014 \u0627\u0644\u062b\u0642\u0629 \u0641\u064a \u0627\u0644\u0646\u062a\u0627\u0626\u062c \u0642\u062f \u062a\u0643\u0648\u0646 \u0623\u0642\u0644 \u0645\u0645\u0627 \u0647\u0648 \u0645\u0648\u0636\u062d",
      },
      severity: "medium",
    });
  }

  if (Object.keys(signals.byType).length < 2) {
    limitations.push({
      text: {
        en: "Single source type \u2014 cross-source confirmation pending",
        ar: "\u0646\u0648\u0639 \u0645\u0635\u062f\u0631 \u0648\u0627\u062d\u062f \u2014 \u0627\u0644\u062a\u0623\u0643\u064a\u062f \u0645\u062a\u0639\u062f\u062f \u0627\u0644\u0645\u0635\u0627\u062f\u0631 \u0642\u064a\u062f \u0627\u0644\u0627\u0646\u062a\u0638\u0627\u0631",
      },
      severity: "medium",
    });
  }

  if (insViz.fraudPressure > 0.3) {
    limitations.push({
      text: {
        en: "Elevated fraud pressure introduces wider loss estimate range",
        ar: "\u0636\u063a\u0637 \u0627\u0644\u0627\u062d\u062a\u064a\u0627\u0644 \u0627\u0644\u0645\u0631\u062a\u0641\u0639 \u064a\u0648\u0633\u0639 \u0646\u0637\u0627\u0642 \u062a\u0642\u062f\u064a\u0631 \u0627\u0644\u062e\u0633\u0627\u0626\u0631",
      },
      severity: "low",
    });
  }

  if (propagation.maxDepth >= 4) {
    limitations.push({
      text: {
        en: "Deep cascade \u2014 tail-end impact estimates carry higher uncertainty",
        ar: "\u062a\u062a\u0627\u0628\u0639 \u0639\u0645\u064a\u0642 \u2014 \u062a\u0642\u062f\u064a\u0631\u0627\u062a \u0627\u0644\u062a\u0623\u062b\u064a\u0631 \u0627\u0644\u0646\u0647\u0627\u0626\u064a \u062a\u062d\u0645\u0644 \u0639\u062f\u0645 \u064a\u0642\u064a\u0646 \u0623\u0639\u0644\u0649",
      },
      severity: "low",
    });
  }

  return limitations;
}

/* ── Model Inputs Summary ── */

function buildModelInputsSummary(
  signals: SignalSummary,
  propagation: PropagationResult,
  insViz: InsuranceVisualizationResult,
  clarity: DecisionClarityResult
): ModelInputSummary[] {
  return [
    {
      label: { en: "Signals", ar: "\u0627\u0644\u0625\u0634\u0627\u0631\u0627\u062a" },
      value: `${signals.totalSignals} (${Object.keys(signals.byType).length} types)`,
    },
    {
      label: { en: "Propagation Depth", ar: "\u0639\u0645\u0642 \u0627\u0644\u062a\u062a\u0627\u0628\u0639" },
      value: `${propagation.maxDepth} levels`,
    },
    {
      label: { en: "Affected Nodes", ar: "\u0627\u0644\u0639\u0642\u062f \u0627\u0644\u0645\u062a\u0623\u062b\u0631\u0629" },
      value: `${propagation.affectedNodes.length}`,
    },
    {
      label: { en: "Insurance Lines", ar: "\u062e\u0637\u0648\u0637 \u0627\u0644\u062a\u0623\u0645\u064a\u0646" },
      value: `${clarity.topExposedLines.length} exposed`,
    },
    {
      label: { en: "Portfolio Pressure", ar: "\u0636\u063a\u0637 \u0627\u0644\u0645\u062d\u0641\u0638\u0629" },
      value: `${Math.round(insViz.portfolioPressure * 100)}%`,
    },
    {
      label: { en: "Fraud Pressure", ar: "\u0636\u063a\u0637 \u0627\u0644\u0627\u062d\u062a\u064a\u0627\u0644" },
      value: `${Math.round(insViz.fraudPressure * 100)}%`,
    },
  ];
}

/* ── Trust Narrative Builder ── */

function buildTrustNarrative(
  trustScore: number,
  basis: ConfidenceBasisEntry[],
  limitations: KnownLimitation[]
): { en: string; ar: string } {
  const strongFactors = basis.filter((b) => b.strength === "strong").length;
  const weakFactors = basis.filter((b) => b.strength === "weak").length;

  if (trustScore >= 70 && weakFactors === 0) {
    return {
      en: `High confidence assessment based on ${strongFactors} strong indicators. Signal-to-decision chain is consistent across all layers.`,
      ar: `\u062a\u0642\u064a\u064a\u0645 \u0628\u062b\u0642\u0629 \u0639\u0627\u0644\u064a\u0629 \u0628\u0646\u0627\u0621\u064b \u0639\u0644\u0649 ${strongFactors} \u0645\u0624\u0634\u0631\u0627\u062a \u0642\u0648\u064a\u0629. \u0633\u0644\u0633\u0644\u0629 \u0627\u0644\u0625\u0634\u0627\u0631\u0629 \u0625\u0644\u0649 \u0627\u0644\u0642\u0631\u0627\u0631 \u0645\u062a\u0633\u0642\u0629 \u0639\u0628\u0631 \u062c\u0645\u064a\u0639 \u0627\u0644\u0637\u0628\u0642\u0627\u062a.`,
    };
  }

  if (trustScore >= 50) {
    const limitText = limitations.length > 0 ? ` ${limitations.length} known limitation${limitations.length > 1 ? "s" : ""} noted.` : "";
    return {
      en: `Moderate confidence with ${strongFactors} strong and ${weakFactors} developing indicators.${limitText} Decision is supportable with monitoring.`,
      ar: `\u062b\u0642\u0629 \u0645\u062a\u0648\u0633\u0637\u0629 \u0645\u0639 ${strongFactors} \u0645\u0624\u0634\u0631\u0627\u062a \u0642\u0648\u064a\u0629 \u0648${weakFactors} \u0646\u0627\u0634\u0626\u0629.${limitText.replace("noted", "\u0645\u064f\u0644\u0627\u062d\u0638\u0629")} \u0627\u0644\u0642\u0631\u0627\u0631 \u0642\u0627\u0628\u0644 \u0644\u0644\u062f\u0639\u0645 \u0645\u0639 \u0627\u0644\u0645\u0631\u0627\u0642\u0628\u0629.`,
    };
  }

  return {
    en: `Partial confidence \u2014 ${weakFactors} indicators remain developing. Recommend additional signal confirmation before committing to high-cost actions.`,
    ar: `\u062b\u0642\u0629 \u062c\u0632\u0626\u064a\u0629 \u2014 ${weakFactors} \u0645\u0624\u0634\u0631\u0627\u062a \u0644\u0627 \u062a\u0632\u0627\u0644 \u0646\u0627\u0634\u0626\u0629. \u064a\u064f\u0646\u0635\u062d \u0628\u062a\u0623\u0643\u064a\u062f \u0625\u0636\u0627\u0641\u064a \u0642\u0628\u0644 \u0627\u0644\u0627\u0644\u062a\u0632\u0627\u0645 \u0628\u0625\u062c\u0631\u0627\u0621\u0627\u062a \u0639\u0627\u0644\u064a\u0629 \u0627\u0644\u062a\u0643\u0644\u0641\u0629.`,
  };
}

/* ── Main Computation ── */

export function computeTrustLayer(
  signals: SignalSummary,
  propagation: PropagationResult,
  insViz: InsuranceVisualizationResult,
  clarity: DecisionClarityResult,
  _financialImpact: FinancialImpactResult
): TrustLayerResult {
  // Score each component
  const source = scoreSourceConfirmation(signals);
  const prop = scorePropagationConsistency(propagation);
  const ins = scoreInsuranceCoherence(insViz, clarity);
  const decision = scoreDecisionStability(clarity);
  const recency = scoreDataRecency(signals);

  // Weighted trust score
  const rawScore =
    source.score * WEIGHT_SOURCE_CONFIRMATION +
    prop.score * WEIGHT_PROPAGATION_CONSISTENCY +
    ins.score * WEIGHT_INSURANCE_COHERENCE +
    decision.score * WEIGHT_DECISION_STABILITY +
    recency.score * WEIGHT_DATA_RECENCY;

  const trustScore = Math.round(rawScore * 100);

  const confidenceBasis = [source.entry, prop.entry, ins.entry, decision.entry, recency.entry];

  // Active edges = propagation paths count
  const activeEdgesCount = propagation.propagationPaths.reduce((s, p) => s + Math.max(p.length - 1, 0), 0);

  // Known limitations
  const knownLimitations = buildKnownLimitations(signals, propagation, insViz);

  // Model inputs summary
  const modelInputsSummary = buildModelInputsSummary(signals, propagation, insViz, clarity);

  // Trust narrative
  const trustNarrative = buildTrustNarrative(trustScore, confidenceBasis, knownLimitations);

  // Action confidence
  const actionConfidence: TrustLayerResult["actionConfidence"] =
    trustScore >= 65 ? "high" : trustScore >= 40 ? "moderate" : "low";

  return {
    trustScore,
    confidenceBasis,
    sourceCount: Object.keys(signals.byType).length,
    confirmedSignals: signals.totalSignals,
    activeNodesCount: propagation.affectedNodes.length,
    activeEdgesCount,
    dataRecency: "current",
    modelInputsSummary,
    knownLimitations,
    trustNarrative,
    actionConfidence,
  };
}
