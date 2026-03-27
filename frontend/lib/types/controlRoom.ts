/* ── Control Room Command Center Types ──
   Palantir-class regional command center data contracts.
   Every type maps to a visual region in the 5-zone CSS grid. */

import type { Lang } from "./i18n";
import type { CrisisAssessment, NodeImpact, AirportImpact } from "./crisis";
import type { DecisionIntelligenceBundle, DecisionOption } from "./decision-intelligence";

/* ── Enums ── */

export type ThreatLevel = "critical" | "high" | "elevated" | "guarded" | "low";
export type IncidentPhase = "detection" | "assessment" | "response" | "recovery" | "post_incident";
export type LayerVisibility = "visible" | "hidden" | "loading";
export type TimelineTaskStatus = "pending" | "in_progress" | "completed" | "overdue" | "blocked";

/* ── Geospatial ── */

export interface GeoCoord {
  lat: number;
  lng: number;
  alt?: number;
}

export interface GeoNode {
  id: string;
  label: string;
  type: "airport" | "port" | "oil_facility" | "exchange" | "military_base" | "city" | "chokepoint";
  coord: GeoCoord;
  country: string;
  severity: number;       // 0-1
  status: ThreatLevel;
  metadata?: Record<string, string | number>;
}

export interface GeoRoute {
  id: string;
  from: GeoCoord;
  to: GeoCoord;
  routeType: "air" | "sea" | "oil_pipeline" | "supply_chain";
  severity: number;       // 0-1
  label?: string;
  disrupted: boolean;
}

export interface ImpactHeatCell {
  coord: GeoCoord;
  intensity: number;      // 0-1
  radius_km: number;
  category: string;
}

/* ── Geospatial Layer System ── */

export interface GeoLayer {
  id: string;
  label: string;
  visibility: LayerVisibility;
  nodeCount: number;
}

/* ── Situation Rail (Left) ── */

export interface IncidentCase {
  id: string;
  title: string;
  phase: IncidentPhase;
  threatLevel: ThreatLevel;
  timestamp: string;        // ISO 8601
  summary: string;
  affectedCountries: string[];
  primarySector: string;
  keyMetrics: IncidentMetric[];
}

export interface IncidentMetric {
  label: string;
  value: number | string;
  unit?: string;
  trend?: "up" | "down" | "stable";
  severity?: ThreatLevel;
}

/* ── Decision Rail (Right) ── */

export interface CourseOfAction {
  id: string;
  title: string;
  description: string;
  kpis: COAKpi[];
  requirements: string[];
  riskReduction: number;    // 0-1
  cost: string;
  timeframe: string;
  confidence: number;       // 0-1
  recommendation: "strongly_recommended" | "recommended" | "conditional" | "not_recommended";
  selected: boolean;
}

export interface COAKpi {
  label: string;
  target: number | string;
  current: number | string;
  unit?: string;
}

/* ── Execution Timeline (Bottom) ── */

export interface TimelineTask {
  id: string;
  label: string;
  startHour: number;        // offset from T0
  durationHours: number;
  status: TimelineTaskStatus;
  owner?: string;
  dependencies?: string[];  // task IDs
  lane: string;             // group/swim lane
}

export interface TimelineConfig {
  t0: string;               // ISO 8601 — incident start
  horizonHours: number;     // total visible hours
  currentHour: number;      // playhead position
}

/* ── Top Command Bar ── */

export interface CommandBarState {
  scenarioTitle: string;
  threatLevel: ThreatLevel;
  activeIncidentCount: number;
  currentPhase: IncidentPhase;
  confidenceScore: number;
  timestamp: string;
}

/* ── Aggregated Control Room State ── */

export interface ControlRoomState {
  /* Meta */
  lang: Lang;
  loading: boolean;
  error: string | null;

  /* Command Bar */
  commandBar: CommandBarState;

  /* Geospatial */
  geoNodes: GeoNode[];
  geoRoutes: GeoRoute[];
  heatmap: ImpactHeatCell[];
  layers: GeoLayer[];
  selectedNodeId: string | null;
  globeViewState: {
    lat: number;
    lng: number;
    zoom: number;
    heading: number;
    pitch: number;
  };

  /* Situation Rail */
  incident: IncidentCase | null;

  /* Decision Rail */
  coursesOfAction: CourseOfAction[];
  selectedCOAId: string | null;

  /* Timeline */
  timeline: TimelineConfig;
  tasks: TimelineTask[];

  /* Data Sources */
  assessment: CrisisAssessment | null;
  diBundle: DecisionIntelligenceBundle | null;
}

/* ── Actions ── */

export type ControlRoomAction =
  | { type: "SET_LANG"; lang: Lang }
  | { type: "SET_LOADING"; loading: boolean }
  | { type: "SET_ERROR"; error: string | null }
  | { type: "SET_ASSESSMENT"; assessment: CrisisAssessment }
  | { type: "SET_DI_BUNDLE"; bundle: DecisionIntelligenceBundle }
  | { type: "SELECT_NODE"; nodeId: string | null }
  | { type: "SELECT_COA"; coaId: string | null }
  | { type: "TOGGLE_LAYER"; layerId: string }
  | { type: "SET_TIMELINE_HOUR"; hour: number }
  | { type: "SET_GLOBE_VIEW"; view: ControlRoomState["globeViewState"] }
  | { type: "HYDRATE"; state: Partial<ControlRoomState> };
