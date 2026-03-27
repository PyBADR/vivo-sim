/* ── Demo Scenarios ──
   Pre-built propagation scenarios for demonstration.
   Each scenario defines:
   - Signal inputs (source nodes, severity, timing)
   - Expected propagation cascade
   - Narrative events for the timeline

   "Gulf Airspace Disruption" is the benchmark scenario. */

import { propagate, propagateMultiSignal } from "@/lib/engine/propagation";
import { calculateInsuranceExposure } from "@/lib/engine/insurance";
import { generateDecision } from "@/lib/engine/decisionEngine";
import { summarizeSignals, type LiveSignal } from "@/lib/engine/signals";
import { buildPlaybackFrames, type PlaybackFrame, DEFAULT_PLAYBACK_CONFIG } from "./propagationPlayback";
import { ALL_GCC_NODES } from "@/lib/map/data/gccNodes";

/* ── Scenario Definition ── */

export interface DemoScenario {
  id: string;
  title: { en: string; ar: string };
  description: { en: string; ar: string };
  signals: DemoSignal[];
  narrativeEvents: NarrativeEvent[];
  expectedDuration: number; // hours
}

export interface DemoSignal {
  nodeId: string;
  score: number;
  hoursElapsed: number;
  label: string;
}

export interface NarrativeEvent {
  hour: number;
  normalizedTime: number;
  title: { en: string; ar: string };
  description: { en: string; ar: string };
  severity: "info" | "warning" | "critical";
  relatedNodes: string[];
}

/* ── Computed Demo Result ── */

export interface DemoResult {
  scenario: DemoScenario;
  frames: PlaybackFrame[];
  narrativeEvents: NarrativeEvent[];
  propagationResult: ReturnType<typeof propagateMultiSignal>;
  insuranceResult: ReturnType<typeof calculateInsuranceExposure>;
  decisionResult: ReturnType<typeof generateDecision>;
  nodeCoords: Map<string, { lat: number; lng: number }>;
}

/* ── Gulf Airspace Disruption ──
   Benchmark scenario: Iranian military activity triggers
   Gulf airspace restrictions → cascading aviation + energy + trade disruption.

   Signal → HORMUZ → Gulf airports activate → airlines disrupted →
   cargo/logistics affected → energy supply chain stressed →
   insurance pressure builds → decision escalation */

export const GULF_AIRSPACE_DISRUPTION: DemoScenario = {
  id: "gulf-airspace-disruption",
  title: {
    en: "Gulf Airspace Disruption",
    ar: "اضطراب المجال الجوي الخليجي",
  },
  description: {
    en: "Iranian military escalation triggers Gulf airspace restrictions, cascading through aviation, energy, and maritime sectors across all GCC states.",
    ar: "تصعيد عسكري إيراني يؤدي إلى فرض قيود على المجال الجوي الخليجي، مما يتسبب في تأثيرات متتالية عبر قطاعات الطيران والطاقة والبحرية في جميع دول مجلس التعاون.",
  },
  signals: [
    // Primary signal: Strait of Hormuz threat
    { nodeId: "HORMUZ", score: 0.85, hoursElapsed: 0, label: "Hormuz Strait military activity detected" },
    // Secondary: Gulf airspace restriction notice
    { nodeId: "DXB", score: 0.70, hoursElapsed: 2, label: "UAE NOTAM: Gulf airspace restricted" },
    // Tertiary: Energy infrastructure alert
    { nodeId: "ARAMCO", score: 0.55, hoursElapsed: 4, label: "Saudi Aramco heightened security posture" },
    // Market signal
    { nodeId: "TADAWUL", score: 0.40, hoursElapsed: 6, label: "Tadawul trading volume spike" },
  ],
  narrativeEvents: [
    {
      hour: 0,
      normalizedTime: 0,
      title: { en: "Signal Detected", ar: "اكتشاف إشارة" },
      description: {
        en: "Iranian naval activity detected near Strait of Hormuz. Elevated military posture confirmed by multiple sources.",
        ar: "رصد نشاط بحري إيراني بالقرب من مضيق هرمز. تأكيد الوضع العسكري المتصاعد من مصادر متعددة.",
      },
      severity: "warning",
      relatedNodes: ["HORMUZ"],
    },
    {
      hour: 2,
      normalizedTime: 2 / 72,
      title: { en: "Airspace Restrictions", ar: "قيود المجال الجوي" },
      description: {
        en: "UAE issues NOTAM restricting Gulf airspace. Dubai International and Abu Dhabi airports activate contingency routing.",
        ar: "الإمارات تصدر إشعار للملاحين بتقييد المجال الجوي الخليجي. مطارا دبي وأبوظبي يفعلان مسارات الطوارئ.",
      },
      severity: "critical",
      relatedNodes: ["DXB", "AUH", "DWC"],
    },
    {
      hour: 4,
      normalizedTime: 4 / 72,
      title: { en: "Energy Alert", ar: "تنبيه الطاقة" },
      description: {
        en: "Saudi Aramco activates heightened security across Eastern Province facilities. Oil export monitoring elevated.",
        ar: "أرامكو السعودية تفعل حالة الأمن المرتفع في منشآت المنطقة الشرقية. رفع مستوى مراقبة صادرات النفط.",
      },
      severity: "warning",
      relatedNodes: ["ARAMCO", "RAS_TANURA", "JUBAIL"],
    },
    {
      hour: 6,
      normalizedTime: 6 / 72,
      title: { en: "Market Impact", ar: "تأثير السوق" },
      description: {
        en: "Regional exchanges see volume spikes. Tadawul, DFM, and ADX showing elevated volatility in energy and aviation sectors.",
        ar: "البورصات الإقليمية تشهد ارتفاعاً في حجم التداول. تداول وسوق دبي وأبوظبي تظهر تقلبات مرتفعة.",
      },
      severity: "warning",
      relatedNodes: ["TADAWUL", "DFM", "ADX"],
    },
    {
      hour: 12,
      normalizedTime: 12 / 72,
      title: { en: "Cascade Expansion", ar: "توسع التأثير المتتالي" },
      description: {
        en: "Propagation reaches Kuwait, Bahrain, and Oman airports. Maritime insurance rates spike for Gulf transits.",
        ar: "التأثير يصل إلى مطارات الكويت والبحرين وعمان. أسعار التأمين البحري ترتفع لعبور الخليج.",
      },
      severity: "critical",
      relatedNodes: ["KWI", "BAH", "MCT"],
    },
    {
      hour: 24,
      normalizedTime: 24 / 72,
      title: { en: "Full Regional Impact", ar: "التأثير الإقليمي الكامل" },
      description: {
        en: "All GCC airports operating under contingency. Cargo logistics delayed 48-72h. Insurance underwriters activating exclusion clauses.",
        ar: "جميع مطارات الخليج تعمل بخطط الطوارئ. تأخر الشحن 48-72 ساعة. شركات التأمين تفعل شروط الاستثناء.",
      },
      severity: "critical",
      relatedNodes: ["DXB", "DOH", "RUH", "KWI", "BAH", "MCT"],
    },
    {
      hour: 48,
      normalizedTime: 48 / 72,
      title: { en: "Decision Point", ar: "نقطة القرار" },
      description: {
        en: "Risk assessment indicates activate_response threshold breached. Emergency protocol evaluation underway.",
        ar: "تقييم المخاطر يشير إلى تجاوز عتبة تفعيل الاستجابة. جاري تقييم بروتوكول الطوارئ.",
      },
      severity: "critical",
      relatedNodes: [],
    },
  ],
  expectedDuration: 72,
};

/* ── Run Demo Scenario ──
   Executes the propagation engine with the scenario signals,
   builds playback frames, and returns the complete result. */

export function runDemoScenario(scenario: DemoScenario = GULF_AIRSPACE_DISRUPTION): DemoResult {
  // Build node coordinate map
  const nodeCoords = new Map<string, { lat: number; lng: number }>();
  for (const node of ALL_GCC_NODES) {
    nodeCoords.set(node.id, { lat: node.coord.lat, lng: node.coord.lng });
  }

  // Run multi-signal propagation
  const signalInputs = scenario.signals.map((s) => ({
    nodeId: s.nodeId,
    score: s.score,
    hoursElapsed: s.hoursElapsed,
  }));

  const propagationResult = propagateMultiSignal(signalInputs);

  // Build sector impacts for insurance calculation
  const sectorMap = new Map<string, number>();
  for (const node of propagationResult.affectedNodes) {
    const current = sectorMap.get(node.sector) ?? 0;
    sectorMap.set(node.sector, Math.max(current, node.impactScore));
  }

  const sectorImpacts = {
    aviation: sectorMap.get("aviation") ?? 0,
    energy: sectorMap.get("energy") ?? 0,
    maritime: sectorMap.get("maritime") ?? 0,
    finance: sectorMap.get("finance") ?? 0,
  };

  // Calculate insurance exposure
  const insuranceResult = calculateInsuranceExposure(propagationResult, sectorImpacts);

  // Build synthetic signal summary for decision engine
  const mockSignals: LiveSignal[] = scenario.signals.map((s) => ({
    id: `demo-${s.nodeId}`,
    type: "news" as const,
    title: s.label,
    severity: s.score,
    confidence: 0.8,
    region: "GCC",
    entities: [s.nodeId],
    impact_vector: { aviation: 0.8, energy: 0.7, maritime: 0.6, finance: 0.5, insurance: 0.4 },
    sourceCredibility: 0.85,
    gccRelevance: 0.9,
    confirmation: scenario.signals.length > 1 ? 0.7 : 0.3,
    timestamp: new Date(Date.now() - s.hoursElapsed * 3_600_000).toISOString(),
    source: "DEMO",
  }));

  const signalSummary = summarizeSignals(mockSignals);
  const decisionResult = generateDecision(propagationResult, insuranceResult, signalSummary);

  // Build playback frames
  const config = {
    ...DEFAULT_PLAYBACK_CONFIG,
    totalHours: scenario.expectedDuration,
  };
  const frames = buildPlaybackFrames(propagationResult, nodeCoords, config);

  // Normalize narrative events to match frame timing
  const narrativeEvents = scenario.narrativeEvents.map((ev) => ({
    ...ev,
    normalizedTime: ev.hour / scenario.expectedDuration,
  }));

  return {
    scenario,
    frames,
    narrativeEvents,
    propagationResult,
    insuranceResult,
    decisionResult,
    nodeCoords,
  };
}
