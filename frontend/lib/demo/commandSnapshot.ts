/* ── Command Snapshot Model ──
   Deterministic executive summary from real engine outputs.
   Every word traceable to engine state. No fake summaries.
   No generic language. Boardroom-grade output. */

import type { SignalSummary } from "@/lib/engine/signals";
import type { PropagationResult } from "@/lib/engine/propagation";
import type { DecisionClarityResult, ExposedLine } from "@/lib/decision/decisionClarity";
import type { InsuranceVisualizationResult } from "@/lib/insurance/insuranceVisualization";
import type { PlaybackSnapshot } from "@/lib/types/controlRoom";

/* ── Time Band ── */

export type TimeBand = "immediate" | "plus_12h" | "plus_24_48h" | "medium_horizon";

export interface TimeToImpactEntry {
  band: TimeBand;
  label: { en: string; ar: string };
  sectors: string[];
  exposedLines: string[];
  consequence: { en: string; ar: string };
}

/* ── Confidence Narrative ── */

export interface ConfidenceNarrative {
  level: "high" | "moderate" | "low";
  text: { en: string; ar: string };
}

/* ── Command Snapshot ── */

export interface CommandSnapshot {
  headline: { en: string; ar: string };
  subheadline: { en: string; ar: string };
  affectedEntitiesCount: number;
  topAffectedRegions: string[];
  topAffectedSectors: string[];
  topExposedLines: { name: { en: string; ar: string }; score: number }[];
  peakRiskScore: number;
  peakRiskState: string;
  decisionState: string;
  confidenceNarrative: ConfidenceNarrative;
  immediateAction: { en: string; ar: string };
  timeToImpact: TimeToImpactEntry[];
  whyItMatters: { en: string; ar: string };
}

/* ── Time Band Labels ── */

const TIME_BAND_LABELS: Record<TimeBand, { en: string; ar: string }> = {
  immediate:      { en: "Immediate",    ar: "فوري" },
  plus_12h:       { en: "+12h",         ar: "+12 ساعة" },
  plus_24_48h:    { en: "+24–48h",      ar: "+24-48 ساعة" },
  medium_horizon: { en: "Medium Horizon", ar: "أفق متوسط" },
};

/* ── Compute Command Snapshot ── */

export function computeCommandSnapshot(
  signalSummary: SignalSummary,
  propagation: PropagationResult,
  insuranceViz: InsuranceVisualizationResult,
  clarity: DecisionClarityResult,
  playback: PlaybackSnapshot
): CommandSnapshot {
  const topSignal = signalSummary.topSignals[0];
  const topEntity = clarity.affectedEntities[0];
  const entityCount = clarity.affectedEntities.length;

  // Regions from affected entities
  const regionSet = new Set(clarity.affectedEntities.map((e) => e.country));
  const topRegions = Array.from(regionSet).slice(0, 4);

  // Sectors from affected entities
  const sectorSet = new Set(clarity.affectedEntities.map((e) => e.sector));
  const topSectors = Array.from(sectorSet).slice(0, 4);

  // Exposed lines
  const topLines = clarity.topExposedLines.slice(0, 3).map((l) => ({
    name: l.displayName,
    score: l.exposureScore,
  }));

  // Headline — describe the command situation from the top signal
  const headline = buildHeadline(topSignal, propagation, clarity);

  // Subheadline — entity count + top sector
  const subheadline = buildSubheadline(entityCount, topSectors, topRegions, clarity);

  // Confidence narrative
  const confidenceNarrative = buildConfidenceNarrative(signalSummary, propagation, clarity);

  // Immediate action from top recommended action
  const topAction = clarity.recommendedActions.find((a) => a.urgency === "immediate") ?? clarity.recommendedActions[0];
  const immediateAction = topAction
    ? { en: topAction.action, ar: topAction.action }
    : { en: "Monitor and assess developing situation", ar: "مراقبة وتقييم الموقف المتطور" };

  // Time to impact
  const timeToImpact = buildTimeToImpact(clarity, insuranceViz, propagation);

  // Why it matters
  const whyItMatters = buildWhyItMatters(clarity, insuranceViz, propagation);

  return {
    headline,
    subheadline,
    affectedEntitiesCount: entityCount,
    topAffectedRegions: topRegions,
    topAffectedSectors: topSectors,
    topExposedLines: topLines,
    peakRiskScore: Math.round(clarity.finalRisk * 100),
    peakRiskState: clarity.decisionState,
    decisionState: playback.currentDecision || clarity.decisionState,
    confidenceNarrative,
    immediateAction,
    timeToImpact,
    whyItMatters,
  };
}

/* ── Headline Builder ── */

function buildHeadline(
  topSignal: SignalSummary["topSignals"][0] | undefined,
  propagation: PropagationResult,
  clarity: DecisionClarityResult
): { en: string; ar: string } {
  const riskPct = Math.round(clarity.finalRisk * 100);
  const signalName = topSignal?.title ?? "Regional Disruption";

  if (clarity.decisionState === "emergency_protocol") {
    return {
      en: `${signalName} — Emergency Protocol at ${riskPct}%`,
      ar: `${signalName} — بروتوكول طوارئ عند ${riskPct}%`,
    };
  }
  if (clarity.decisionState === "activate_response") {
    return {
      en: `${signalName} — Response Activated`,
      ar: `${signalName} — تم تفعيل الاستجابة`,
    };
  }
  if (clarity.decisionState === "escalate") {
    return {
      en: `${signalName} — Escalation in Progress`,
      ar: `${signalName} — تصعيد جارٍ`,
    };
  }
  return {
    en: `${signalName} — Monitoring`,
    ar: `${signalName} — مراقبة`,
  };
}

/* ── Subheadline Builder ── */

function buildSubheadline(
  entityCount: number,
  sectors: string[],
  regions: string[],
  clarity: DecisionClarityResult
): { en: string; ar: string } {
  const sectorStr = sectors.slice(0, 2).join(", ");
  const regionStr = regions.slice(0, 3).join(", ");

  return {
    en: `${entityCount} critical nodes affected across ${sectorStr} in ${regionStr}`,
    ar: `${entityCount} عقد حرجة متأثرة عبر ${sectorStr} في ${regionStr}`,
  };
}

/* ── Confidence Narrative Builder ── */

function buildConfidenceNarrative(
  signalSummary: SignalSummary,
  propagation: PropagationResult,
  clarity: DecisionClarityResult
): ConfidenceNarrative {
  const signalCount = signalSummary.totalSignals;
  const sourceTypes = Object.keys(signalSummary.byType).length;
  const cascadeLevels = propagation.maxDepth;
  const confidence = clarity.confidence;

  if (confidence >= 0.75 && signalCount >= 3 && sourceTypes >= 2) {
    return {
      level: "high",
      text: {
        en: `High confidence: ${signalCount} signals from ${sourceTypes} source types with ${cascadeLevels}-level propagation consistency`,
        ar: `ثقة عالية: ${signalCount} إشارات من ${sourceTypes} أنواع مصادر مع اتساق تتابع ${cascadeLevels} مستويات`,
      },
    };
  }

  if (confidence >= 0.50) {
    return {
      level: "moderate",
      text: {
        en: `Moderate confidence: ${signalCount} signals with partial cross-source confirmation and emerging downstream impact`,
        ar: `ثقة متوسطة: ${signalCount} إشارات مع تأكيد جزئي متعدد المصادر وتأثير ناشئ`,
      },
    };
  }

  return {
    level: "low",
    text: {
      en: `Elevated uncertainty: limited source confirmation across ${signalCount} signals — downstream propagation incomplete`,
      ar: `عدم يقين مرتفع: تأكيد محدود عبر ${signalCount} إشارات — التتابع غير مكتمل`,
    },
  };
}

/* ── Time to Impact Builder ── */

function buildTimeToImpact(
  clarity: DecisionClarityResult,
  insuranceViz: InsuranceVisualizationResult,
  propagation: PropagationResult
): TimeToImpactEntry[] {
  const entries: TimeToImpactEntry[] = [];

  // Immediate: entities at depth 0-1 (direct impact)
  const immediateEntities = clarity.affectedEntities.filter(
    (e) => e.role === "Primary source" || e.role === "Direct dependency"
  );
  if (immediateEntities.length > 0) {
    const immSectors = Array.from(new Set(immediateEntities.map((e) => e.sector)));
    const immLines = clarity.topExposedLines
      .filter((l) => l.urgency === "critical")
      .map((l) => l.displayName.en);
    entries.push({
      band: "immediate",
      label: TIME_BAND_LABELS.immediate,
      sectors: immSectors,
      exposedLines: immLines.length > 0 ? immLines : [clarity.topExposedLines[0]?.displayName.en ?? ""],
      consequence: {
        en: `${immediateEntities[0]?.label ?? "Primary"} disruption — direct operational impact`,
        ar: `تعطل ${immediateEntities[0]?.label ?? "الأساسية"} — تأثير تشغيلي مباشر`,
      },
    });
  }

  // +12h: cascade targets
  const cascadeEntities = clarity.affectedEntities.filter((e) => e.role === "Cascade target");
  if (cascadeEntities.length > 0) {
    const casSectors = Array.from(new Set(cascadeEntities.map((e) => e.sector)));
    const casLines = clarity.topExposedLines
      .filter((l) => l.urgency === "elevated")
      .map((l) => l.displayName.en);
    entries.push({
      band: "plus_12h",
      label: TIME_BAND_LABELS.plus_12h,
      sectors: casSectors,
      exposedLines: casLines.length > 0 ? casLines : [],
      consequence: {
        en: `Cascade delay exposure across ${casSectors.join(", ")}`,
        ar: `انكشاف تأخير متتالي عبر ${casSectors.join("، ")}`,
      },
    });
  }

  // +24-48h: claims pressure from elevated lines
  const elevatedLines = clarity.topExposedLines.filter(
    (l) => l.urgency === "elevated" || l.urgency === "rising"
  );
  if (elevatedLines.length > 0) {
    entries.push({
      band: "plus_24_48h",
      label: TIME_BAND_LABELS.plus_24_48h,
      sectors: Array.from(new Set(elevatedLines.map(() => "insurance"))),
      exposedLines: elevatedLines.map((l) => l.displayName.en),
      consequence: {
        en: `Claims surge expected in ${elevatedLines.map((l) => l.displayName.en).join(", ")}`,
        ar: `ارتفاع متوقع في المطالبات لـ ${elevatedLines.map((l) => l.displayName.ar).join("، ")}`,
      },
    });
  }

  // Medium horizon: pricing and fraud effects
  if (insuranceViz.fraudPressure > 0.2 || clarity.topExposedLines.length > 2) {
    entries.push({
      band: "medium_horizon",
      label: TIME_BAND_LABELS.medium_horizon,
      sectors: ["insurance", "finance"],
      exposedLines: [],
      consequence: {
        en: `Pricing adjustment and fraud surveillance required across portfolio`,
        ar: `تعديل تسعير ومراقبة احتيال مطلوبة عبر المحفظة`,
      },
    });
  }

  return entries;
}

/* ── Why It Matters Builder ── */

function buildWhyItMatters(
  clarity: DecisionClarityResult,
  insuranceViz: InsuranceVisualizationResult,
  propagation: PropagationResult
): { en: string; ar: string } {
  const topLine = clarity.topExposedLines[0];
  const lineCount = clarity.topExposedLines.length;
  const entityCount = clarity.affectedEntities.length;
  const cascadeLevels = propagation.maxDepth;

  if (clarity.decisionState === "emergency_protocol") {
    return {
      en: `${entityCount} entities across ${cascadeLevels} cascade levels face immediate disruption. ${lineCount} insurance lines under pressure with portfolio impact at ${Math.round(insuranceViz.portfolioPressure * 100)}%.`,
      ar: `${entityCount} جهة عبر ${cascadeLevels} مستويات تتابع تواجه تعطلاً فورياً. ${lineCount} خطوط تأمين تحت ضغط مع تأثير محفظة بنسبة ${Math.round(insuranceViz.portfolioPressure * 100)}%.`,
    };
  }

  const topLineName = topLine?.displayName.en ?? "Multiple lines";
  const topLineAr = topLine?.displayName.ar ?? "خطوط متعددة";

  return {
    en: `This is likely to increase ${topLineName}-related claims within 24–48 hours and disrupt continuity across GCC corridors. ${lineCount > 1 ? `${lineCount} lines` : topLineName} show rising exposure.`,
    ar: `من المرجح أن يزيد هذا من مطالبات ${topLineAr} خلال 24-48 ساعة ويعطل الاستمرارية عبر ممرات الخليج. ${lineCount > 1 ? `${lineCount} خطوط` : topLineAr} تظهر انكشافاً متزايداً.`,
  };
}
