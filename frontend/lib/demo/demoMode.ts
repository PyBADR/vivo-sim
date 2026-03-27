/* ── Demo Mode Orchestrator ──
   Guided executive walkthrough of the Gulf Airspace Disruption scenario.
   Not just playback — a staged storytelling engine that syncs:
   timeline, map focus, command snapshot, rail updates, insurance overlay,
   decision escalation, and narrative progression.

   Each stage has one dominant story. Non-essential elements dim. */

import type { CommandSnapshot } from "./commandSnapshot";

/* ── Demo Stage ── */

export interface DemoStage {
  id: string;
  title: { en: string; ar: string };
  summary: { en: string; ar: string };
  mapFocusTarget: { lat: number; lng: number; zoom: number };
  dominantNodes: string[];
  dominantEdges: string[];
  dominantExposureLines: string[];
  decisionState: "hold" | "escalate" | "activate_response" | "emergency_protocol";
  recommendedAction: { en: string; ar: string };
  timeBand: "immediate" | "plus_12h" | "plus_24_48h" | "medium_horizon";
  normalizedTimeStart: number;
  normalizedTimeEnd: number;
}

/* ── Demo State ── */

export type DemoStatus = "idle" | "running" | "paused" | "stage_pause" | "complete";

export interface DemoState {
  status: DemoStatus;
  currentStageIndex: number;
  totalStages: number;
  autoAdvance: boolean;
  stageHoldDuration: number; // ms to hold between stage transitions
}

export const INITIAL_DEMO_STATE: DemoState = {
  status: "idle",
  currentStageIndex: 0,
  totalStages: 7,
  autoAdvance: true,
  stageHoldDuration: 2500,
};

/* ── Gulf Airspace Disruption Stages ── */

export const GULF_AIRSPACE_STAGES: DemoStage[] = [
  {
    id: "detection",
    title: { en: "Signal Detected", ar: "كشف الإشارة" },
    summary: { en: "Strait of Hormuz threat signal detected. Initial severity assessment begins.", ar: "كشف إشارة تهديد مضيق هرمز. بدء تقييم الشدة الأولي." },
    mapFocusTarget: { lat: 26.6, lng: 56.2, zoom: 7 },
    dominantNodes: ["HORMUZ"],
    dominantEdges: [],
    dominantExposureLines: [],
    decisionState: "hold",
    recommendedAction: { en: "Monitor signal source and assess credibility", ar: "مراقبة مصدر الإشارة وتقييم المصداقية" },
    timeBand: "immediate",
    normalizedTimeStart: 0,
    normalizedTimeEnd: 0.08,
  },
  {
    id: "airspace_activation",
    title: { en: "Airspace Impact Activated", ar: "تفعيل تأثير المجال الجوي" },
    summary: { en: "Disruption propagates to DXB airport. Gulf airspace operations under pressure.", ar: "انتشار التعطل إلى مطار دبي. عمليات المجال الجوي تحت ضغط." },
    mapFocusTarget: { lat: 25.25, lng: 55.36, zoom: 8 },
    dominantNodes: ["HORMUZ", "DXB"],
    dominantEdges: ["HORMUZ→DXB"],
    dominantExposureLines: ["travel"],
    decisionState: "escalate",
    recommendedAction: { en: "Escalate to regional aviation desk and notify travel underwriting", ar: "التصعيد لمكتب الطيران الإقليمي وإخطار اكتتاب السفر" },
    timeBand: "immediate",
    normalizedTimeStart: 0.08,
    normalizedTimeEnd: 0.20,
  },
  {
    id: "airport_cascade",
    title: { en: "Airport Cascade", ar: "تتابع المطارات" },
    summary: { en: "Disruption cascades to AUH, DOH, KWI. Multi-hub airspace impact confirmed.", ar: "تتابع التعطل إلى أبوظبي والدوحة والكويت. تأثير متعدد المحاور مؤكد." },
    mapFocusTarget: { lat: 25.5, lng: 52.0, zoom: 6 },
    dominantNodes: ["HORMUZ", "DXB", "AUH", "DOH", "KWI"],
    dominantEdges: ["HORMUZ→DXB", "DXB→AUH", "DXB→DOH"],
    dominantExposureLines: ["travel", "motor"],
    decisionState: "escalate",
    recommendedAction: { en: "Tighten travel underwriting for affected corridors", ar: "تشديد اكتتاب السفر للممرات المتأثرة" },
    timeBand: "plus_12h",
    normalizedTimeStart: 0.20,
    normalizedTimeEnd: 0.40,
  },
  {
    id: "corridor_disruption",
    title: { en: "Corridor Disruption", ar: "تعطل الممرات" },
    summary: { en: "Maritime and energy corridors affected. ARAMCO and Jebel Ali under pressure.", ar: "تأثر الممرات البحرية والطاقة. أرامكو وجبل علي تحت ضغط." },
    mapFocusTarget: { lat: 25.5, lng: 53.0, zoom: 5.5 },
    dominantNodes: ["HORMUZ", "ARAMCO_RAS_TANURA", "JEBEL_ALI", "TADAWUL"],
    dominantEdges: ["HORMUZ→ARAMCO_RAS_TANURA", "HORMUZ→JEBEL_ALI"],
    dominantExposureLines: ["marine_cargo", "energy", "property"],
    decisionState: "activate_response",
    recommendedAction: { en: "Activate cross-LOB response — cargo, energy, property underwriting tightening", ar: "تفعيل استجابة متعددة الخطوط — تشديد اكتتاب الشحن والطاقة والممتلكات" },
    timeBand: "plus_12h",
    normalizedTimeStart: 0.40,
    normalizedTimeEnd: 0.60,
  },
  {
    id: "insurance_escalation",
    title: { en: "Insurance Pressure Escalation", ar: "تصعيد ضغط التأمين" },
    summary: { en: "Portfolio pressure rising. Fraud risk elevated across travel and cargo lines.", ar: "ضغط المحفظة يتصاعد. خطر الاحتيال مرتفع عبر خطوط السفر والشحن." },
    mapFocusTarget: { lat: 25.5, lng: 51.0, zoom: 5.5 },
    dominantNodes: ["DXB", "ARAMCO_RAS_TANURA", "JEBEL_ALI", "TADAWUL"],
    dominantEdges: [],
    dominantExposureLines: ["travel", "marine_cargo", "energy", "motor"],
    decisionState: "activate_response",
    recommendedAction: { en: "Prepare claims surge capacity and activate fraud surveillance", ar: "إعداد قدرة استيعاب المطالبات وتفعيل مراقبة الاحتيال" },
    timeBand: "plus_24_48h",
    normalizedTimeStart: 0.60,
    normalizedTimeEnd: 0.78,
  },
  {
    id: "decision_escalation",
    title: { en: "Decision Escalation", ar: "تصعيد القرار" },
    summary: { en: "Risk score crosses emergency threshold. Portfolio-wide impact confirmed.", ar: "درجة المخاطر تتجاوز حد الطوارئ. تأثير على مستوى المحفظة مؤكد." },
    mapFocusTarget: { lat: 25.5, lng: 51.0, zoom: 5 },
    dominantNodes: ["HORMUZ", "DXB", "ARAMCO_RAS_TANURA", "JEBEL_ALI", "TADAWUL"],
    dominantEdges: ["HORMUZ→DXB", "HORMUZ→ARAMCO_RAS_TANURA", "HORMUZ→JEBEL_ALI"],
    dominantExposureLines: ["travel", "marine_cargo", "energy", "motor", "property"],
    decisionState: "emergency_protocol",
    recommendedAction: { en: "Emergency protocol — cease new underwriting on affected lines, surge claims", ar: "بروتوكول طوارئ — إيقاف الاكتتاب الجديد على الخطوط المتأثرة، تصعيد المطالبات" },
    timeBand: "plus_24_48h",
    normalizedTimeStart: 0.78,
    normalizedTimeEnd: 0.92,
  },
  {
    id: "response_recommendation",
    title: { en: "Response Recommendation", ar: "توصية الاستجابة" },
    summary: { en: "Final posture: portfolio protection, pricing adjustment, fraud defenses activated.", ar: "الوضع النهائي: حماية المحفظة، تعديل التسعير، تفعيل دفاعات الاحتيال." },
    mapFocusTarget: { lat: 25.5, lng: 51.0, zoom: 5 },
    dominantNodes: [],
    dominantEdges: [],
    dominantExposureLines: ["travel", "marine_cargo", "energy", "motor", "property", "credit_trade"],
    decisionState: "emergency_protocol",
    recommendedAction: { en: "Execute portfolio protection playbook — restrict, reprice, surge, surveil", ar: "تنفيذ خطة حماية المحفظة — تقييد، إعادة تسعير، تصعيد، مراقبة" },
    timeBand: "medium_horizon",
    normalizedTimeStart: 0.92,
    normalizedTimeEnd: 1.0,
  },
];

/* ── Get Current Stage from Normalized Time ── */

export function getCurrentStage(normalizedTime: number): DemoStage | null {
  for (let i = GULF_AIRSPACE_STAGES.length - 1; i >= 0; i--) {
    if (normalizedTime >= GULF_AIRSPACE_STAGES[i].normalizedTimeStart) {
      return GULF_AIRSPACE_STAGES[i];
    }
  }
  return GULF_AIRSPACE_STAGES[0];
}

export function getCurrentStageIndex(normalizedTime: number): number {
  for (let i = GULF_AIRSPACE_STAGES.length - 1; i >= 0; i--) {
    if (normalizedTime >= GULF_AIRSPACE_STAGES[i].normalizedTimeStart) {
      return i;
    }
  }
  return 0;
}

/* ── Primary Path: which nodes/edges are dominant in current stage ── */

export function getDominantNodeSet(normalizedTime: number): Set<string> {
  const stage = getCurrentStage(normalizedTime);
  return new Set(stage?.dominantNodes ?? []);
}

export function getDominantEdgeSet(normalizedTime: number): Set<string> {
  const stage = getCurrentStage(normalizedTime);
  return new Set(stage?.dominantEdges ?? []);
}

export function isDominantNode(nodeId: string, normalizedTime: number): boolean {
  return getDominantNodeSet(normalizedTime).has(nodeId);
}
