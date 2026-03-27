/* ── Control Room Shared State Store ──
   React context + useReducer for synchronized state across all 5 zones.
   Single source of truth — every panel reads from here, dispatches actions. */

"use client";

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  type Dispatch,
  type ReactNode,
} from "react";
import type {
  ControlRoomState,
  ControlRoomAction,
  GeoNode,
  GeoRoute,
  CourseOfAction,
  TimelineTask,
  IncidentCase,
  ThreatLevel,
  PlaybackSnapshot,
  NarrativeEventDisplay,
} from "@/lib/types/controlRoom";
import type { CrisisAssessment } from "@/lib/types/crisis";
import type { DecisionIntelligenceBundle } from "@/lib/types/decision-intelligence";
import { ALL_GCC_NODES } from "@/lib/map/data/gccNodes";

/* ── Layer Counts from Real Graph ── */

const airportCount = ALL_GCC_NODES.filter((n) => n.type === "airport").length;
const portOilCount = ALL_GCC_NODES.filter((n) => ["port", "oil_facility", "chokepoint"].includes(n.type)).length;
const exchangeCount = ALL_GCC_NODES.filter((n) => n.type === "exchange").length;
const otherCount = ALL_GCC_NODES.filter((n) => n.type === "city").length;

const DEFAULT_LAYERS = [
  { id: "airports", label: "Airports", visibility: "visible" as const, nodeCount: airportCount },
  { id: "ports", label: "Ports & Energy", visibility: "visible" as const, nodeCount: portOilCount },
  { id: "exchanges", label: "Financial Exchanges", visibility: "hidden" as const, nodeCount: exchangeCount },
  { id: "entities", label: "Airlines, Banks, Insurance", visibility: "hidden" as const, nodeCount: otherCount },
  { id: "routes", label: "Trade Routes", visibility: "visible" as const, nodeCount: 0 },
  { id: "heatmap", label: "Impact Overlay", visibility: "hidden" as const, nodeCount: 0 },
];

/* ── Initial State ── */

export const initialControlRoomState: ControlRoomState = {
  lang: "en",
  loading: false,
  error: null,
  commandBar: {
    scenarioTitle: "GCC Regional Crisis Assessment",
    threatLevel: "low",
    activeIncidentCount: 0,
    currentPhase: "detection",
    confidenceScore: 0,
    timestamp: new Date().toISOString(),
  },
  geoNodes: ALL_GCC_NODES.map((n) => ({
    id: n.id,
    label: n.label,
    type: n.type,
    coord: n.coord,
    country: n.country,
    severity: n.severity,
    status: n.status,
  })),
  geoRoutes: [],
  heatmap: [],
  layers: DEFAULT_LAYERS,
  selectedNodeId: null,
  globeViewState: {
    lat: 25.5,
    lng: 51.0,
    zoom: 5.5,
    heading: 0,
    pitch: -35,
  },
  incident: null,
  coursesOfAction: [],
  selectedCOAId: null,
  timeline: {
    t0: new Date().toISOString(),
    horizonHours: 72,
    currentHour: 0,
  },
  tasks: [],
  playback: {
    status: "idle",
    currentFrame: 0,
    totalFrames: 0,
    normalizedTime: 0,
    speed: 1.0,
    hoursElapsed: 0,
    affectedCount: 0,
    maxImpact: 0,
    currentDecision: "hold",
    insurancePressure: 0,
  },
  narrativeEvents: [],
  decisionClarity: null,
  insuranceViz: null,
  assessment: null,
  diBundle: null,
};

/* ── Reducer ── */

function controlRoomReducer(
  state: ControlRoomState,
  action: ControlRoomAction
): ControlRoomState {
  switch (action.type) {
    case "SET_LANG":
      return { ...state, lang: action.lang };
    case "SET_LOADING":
      return { ...state, loading: action.loading };
    case "SET_ERROR":
      return { ...state, error: action.error };
    case "SELECT_NODE":
      return { ...state, selectedNodeId: action.nodeId };
    case "SELECT_COA":
      return { ...state, selectedCOAId: action.coaId };
    case "SET_TIMELINE_HOUR":
      return { ...state, timeline: { ...state.timeline, currentHour: action.hour } };
    case "SET_GLOBE_VIEW":
      return { ...state, globeViewState: action.view };
    case "TOGGLE_LAYER":
      return {
        ...state,
        layers: state.layers.map((l) =>
          l.id === action.layerId
            ? { ...l, visibility: l.visibility === "visible" ? "hidden" : "visible" }
            : l
        ),
      };
    case "SET_ASSESSMENT":
      return hydrateFromAssessment(state, action.assessment);
    case "SET_DI_BUNDLE":
      return hydrateFromDIBundle(state, action.bundle);
    case "HYDRATE":
      return { ...state, ...action.state };

    /* Playback */
    case "SET_PLAYBACK":
      return { ...state, playback: action.playback };

    case "SET_NARRATIVE_EVENTS":
      return { ...state, narrativeEvents: action.events };

    case "SET_DECISION_CLARITY":
      return { ...state, decisionClarity: action.clarity };

    case "SET_INSURANCE_VIZ":
      return { ...state, insuranceViz: action.insuranceViz };

    case "UPDATE_PLAYBACK_FRAME": {
      const updatedNarrative = state.narrativeEvents.map((ev) => ({
        ...ev,
        active: action.normalizedTime >= ev.normalizedTime,
      }));
      return {
        ...state,
        playback: {
          ...state.playback,
          normalizedTime: action.normalizedTime,
          hoursElapsed: action.hoursElapsed,
          affectedCount: action.affectedCount,
          maxImpact: action.maxImpact,
          currentDecision: action.currentDecision,
          insurancePressure: action.insurancePressure,
        },
        narrativeEvents: updatedNarrative,
      };
    }

    default:
      return state;
  }
}

/* ── Hydration: Assessment → GeoNodes, Routes, Incident, Timeline ── */

function threatFromSeverity(s: number): ThreatLevel {
  if (s >= 0.8) return "critical";
  if (s >= 0.6) return "high";
  if (s >= 0.4) return "elevated";
  if (s >= 0.2) return "guarded";
  return "low";
}

function hydrateFromAssessment(
  state: ControlRoomState,
  assessment: CrisisAssessment
): ControlRoomState {
  // Merge airport impact data into geoNodes
  const updatedNodes = state.geoNodes.map((node) => {
    if (node.type === "airport") {
      const impact = assessment.airport_impacts.find(
        (a) => a.airport_code === node.id
      );
      if (impact) {
        return {
          ...node,
          severity: impact.disruption_score,
          status: threatFromSeverity(impact.disruption_score),
        };
      }
    }
    // Update from node_impacts if available
    if (assessment.node_impacts) {
      const ni = assessment.node_impacts.find((n) => n.node_id === node.id);
      if (ni) {
        return {
          ...node,
          severity: ni.severity_score,
          status: threatFromSeverity(ni.severity_score),
        };
      }
    }
    return node;
  });

  // Build routes from propagation data
  const routes: GeoRoute[] = [];
  const hormuz = state.geoNodes.find((n) => n.id === "HORMUZ");
  if (hormuz) {
    for (const airport of updatedNodes.filter((n) => n.type === "airport" && n.severity > 0.3)) {
      routes.push({
        id: `route-${hormuz.id}-${airport.id}`,
        from: hormuz.coord,
        to: airport.coord,
        routeType: "air",
        severity: airport.severity,
        label: `Impact: ${airport.label}`,
        disrupted: airport.severity > 0.6,
      });
    }
  }

  // Build incident from assessment
  const maxAirport = assessment.airport_impacts.reduce(
    (max, a) => (a.disruption_score > max.disruption_score ? a : max),
    assessment.airport_impacts[0]
  );
  const overallThreat = threatFromSeverity(
    maxAirport?.disruption_score ?? 0
  );

  const incident: IncidentCase = {
    id: assessment.scenario_id,
    title: "US-Iran GCC Escalation",
    phase: "assessment",
    threatLevel: overallThreat,
    timestamp: new Date().toISOString(),
    summary: assessment.summary,
    affectedCountries: ["KSA", "UAE", "Qatar", "Kuwait", "Bahrain", "Oman"],
    primarySector: "Aviation & Energy",
    keyMetrics: [
      { label: "Airports Affected", value: assessment.airport_impacts.length, trend: "up", severity: overallThreat },
      { label: "Max Disruption", value: `${Math.round((maxAirport?.disruption_score ?? 0) * 100)}%`, severity: overallThreat },
      { label: "Oil Shock", value: `${Math.round((assessment.energy_impact?.oil_shock ?? 0) * 100)}%`, trend: "up" },
      { label: "Maritime Stress", value: `${Math.round((assessment.maritime_trade_impact?.maritime_trade_score ?? 0) * 100)}%`, trend: "up" },
    ],
  };

  // Build timeline tasks from ranked actions
  const tasks: TimelineTask[] = assessment.ranked_actions.slice(0, 8).map((ra, i) => ({
    id: ra.action_id,
    label: ra.label,
    startHour: i * 4,
    durationHours: Math.max(2, Math.round((1 - ra.timeliness) * 12)),
    status: "pending" as const,
    lane: i < 3 ? "Immediate" : i < 6 ? "Short-term" : "Medium-term",
  }));

  return {
    ...state,
    assessment,
    geoNodes: updatedNodes,
    geoRoutes: routes,
    incident,
    tasks,
    loading: false,
    commandBar: {
      ...state.commandBar,
      threatLevel: overallThreat,
      activeIncidentCount: 1,
      currentPhase: "assessment",
      timestamp: new Date().toISOString(),
    },
  };
}

/* ── Hydration: DI Bundle → COAs, Confidence ── */

function hydrateFromDIBundle(
  state: ControlRoomState,
  bundle: DecisionIntelligenceBundle
): ControlRoomState {
  const coas: CourseOfAction[] = bundle.decision_options.map((opt) => ({
    id: opt.option_id,
    title: opt.title,
    description: opt.description,
    kpis: [
      { label: "Risk Reduction", target: `${Math.round(opt.risk_reduction * 100)}%`, current: "0%", unit: "%" },
      { label: "Confidence", target: `${Math.round(opt.confidence * 100)}%`, current: `${Math.round(opt.confidence * 100)}%` },
    ],
    requirements: opt.dependencies,
    riskReduction: opt.risk_reduction,
    cost: opt.cost_estimate,
    timeframe: opt.time_to_implement,
    confidence: opt.confidence,
    recommendation: opt.recommendation,
    selected: opt.recommendation === "strongly_recommended",
  }));

  return {
    ...state,
    diBundle: bundle,
    coursesOfAction: coas,
    selectedCOAId: coas.find((c) => c.selected)?.id ?? null,
    commandBar: {
      ...state.commandBar,
      confidenceScore: bundle.overall_confidence,
    },
  };
}

/* ── Context ── */

interface ControlRoomContextValue {
  state: ControlRoomState;
  dispatch: Dispatch<ControlRoomAction>;
  loadScenario: () => Promise<void>;
}

const ControlRoomContext = createContext<ControlRoomContextValue | null>(null);

export function useControlRoomStore(): ControlRoomContextValue {
  const ctx = useContext(ControlRoomContext);
  if (!ctx) throw new Error("useControlRoomStore must be used within ControlRoomProvider");
  return ctx;
}

/* ── Provider ── */

export function ControlRoomProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(controlRoomReducer, initialControlRoomState);

  const loadScenario = useCallback(async () => {
    dispatch({ type: "SET_LOADING", loading: true });
    dispatch({ type: "SET_ERROR", error: null });

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";

      // Fetch crisis assessment
      const assessmentRes = await fetch(
        `${apiUrl}/api/v1/scenarios/crisis/packs/us-iran-gcc/assessment`
      );
      if (!assessmentRes.ok) throw new Error(`Assessment API ${assessmentRes.status}`);
      const assessment: CrisisAssessment = await assessmentRes.json();
      dispatch({ type: "SET_ASSESSMENT", assessment });

      // Fetch decision intelligence bundle
      const diRes = await fetch(`${apiUrl}/api/v1/decision-intelligence/us-iran-gcc`);
      if (!diRes.ok) throw new Error(`DI API ${diRes.status}`);
      const bundle: DecisionIntelligenceBundle = await diRes.json();
      dispatch({ type: "SET_DI_BUNDLE", bundle });
    } catch (err) {
      dispatch({
        type: "SET_ERROR",
        error: err instanceof Error ? err.message : "Unknown error",
      });
      dispatch({ type: "SET_LOADING", loading: false });
    }
  }, []);

  return (
    <ControlRoomContext.Provider value={{ state, dispatch, loadScenario }}>
      {children}
    </ControlRoomContext.Provider>
  );
}
