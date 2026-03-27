/* ── Insurance Visualization Model ──
   Translates insurance exposure engine output into visual states
   for the map overlay and UI panels.

   All values derived from real exposure engine output.
   Supports timeline playback state.
   Supports node-level insurance hotspot mapping. */

import type { InsuranceExposureResult, LineExposure, InsuranceLine } from "@/lib/engine/insurance";
import type { PlaybackFrame } from "@/lib/visualization/propagationPlayback";
import type { PropagationResult } from "@/lib/engine/propagation";

/* ── Insurance Visual State ── */

export type InsuranceUrgency = "critical" | "elevated" | "rising" | "stable";

export interface InsuranceVisualLine {
  lob: InsuranceLine;
  displayName: string;
  exposureScore: number;
  severityUplift: number;
  frequencyUplift: number;
  fraudUplift: number;
  underwritingAction: string;
  claimsAction: string;
  urgency: InsuranceUrgency;
}

export interface InsuranceHotspotNode {
  nodeId: string;
  label: string;
  lat: number;
  lng: number;
  insurancePressure: number;   // 0-1
  fraudRisk: number;           // 0-1
  topAffectedLine: InsuranceLine;
  underwritingTightening: boolean;
}

export interface InsuranceVisualizationResult {
  exposedLines: InsuranceVisualLine[];
  portfolioPressure: number;         // 0-1
  fraudPressure: number;             // 0-1
  underwritingState: "normal" | "tighten" | "restrict" | "cease";
  claimsState: "normal" | "monitor" | "surge_prepare" | "emergency";
  hotspotNodes: InsuranceHotspotNode[];
  overlayIntensityByNode: Map<string, number>;
}

/* ── Line-to-Sector Mapping ──
   Which sectors most affect each insurance line. */

const LINE_SECTOR_PRIMARY: Record<InsuranceLine, string> = {
  motor: "logistics",
  health: "government",
  travel: "aviation",
  marine_cargo: "maritime",
  property: "infrastructure",
  liability: "finance",
  energy: "energy",
  credit_trade: "finance",
  life: "government",
  takaful: "insurance",
};

/* ── Compute Insurance Visualization ── */

export function computeInsuranceVisualization(
  insurance: InsuranceExposureResult,
  propagation: PropagationResult,
  playbackFrame: PlaybackFrame | null,
  nodeCoords: Map<string, { lat: number; lng: number }>
): InsuranceVisualizationResult {

  // Exposed lines
  const exposedLines: InsuranceVisualLine[] = insurance.lines
    .filter((l) => l.estimatedImpactPct > 3)
    .map((l) => ({
      lob: l.line,
      displayName: l.line.replace("_", " "),
      exposureScore: l.estimatedImpactPct,
      severityUplift: l.severityUplift,
      frequencyUplift: l.frequencyUplift,
      fraudUplift: l.fraudUplift,
      underwritingAction: l.underwritingAction,
      claimsAction: l.claimsAction,
      urgency: lineUrgency(l),
    }));

  // Portfolio pressure
  const portfolioPressure = Math.min(insurance.total_estimated_impact_pct / 100, 1);

  // Fraud pressure
  const maxFraud = insurance.lines.length > 0
    ? Math.max(...insurance.lines.map((l) => l.fraudUplift))
    : 0;

  // Postures
  const maxExposure = insurance.lines.length > 0 ? insurance.lines[0].estimatedImpactPct : 0;
  const underwritingState: InsuranceVisualizationResult["underwritingState"] =
    maxExposure >= 50 ? "cease" : maxExposure >= 30 ? "restrict" : maxExposure >= 15 ? "tighten" : "normal";

  const playbackDecision = playbackFrame?.currentDecision ?? "hold";
  const claimsState: InsuranceVisualizationResult["claimsState"] =
    playbackDecision === "emergency_protocol" ? "emergency"
    : maxExposure >= 30 ? "surge_prepare"
    : maxExposure >= 15 ? "monitor"
    : "normal";

  // Hotspot nodes: insurance-relevant nodes from propagation
  const hotspotNodes: InsuranceHotspotNode[] = [];
  const overlayIntensityByNode = new Map<string, number>();

  // Map propagation-affected nodes to insurance relevance
  const insuranceSectors = new Set(Object.values(LINE_SECTOR_PRIMARY));
  const topLinesBySector = new Map<string, InsuranceLine>();
  for (const line of insurance.lines) {
    const sector = LINE_SECTOR_PRIMARY[line.line];
    if (!topLinesBySector.has(sector)) {
      topLinesBySector.set(sector, line.line);
    }
  }

  for (const node of propagation.affectedNodes) {
    if (node.impactScore < 0.1) continue;

    const coord = nodeCoords.get(node.nodeId);
    if (!coord) continue;

    // Calculate insurance pressure for this node
    const sectorLine = topLinesBySector.get(node.sector);
    const lineData = sectorLine ? insurance.lines.find((l) => l.line === sectorLine) : undefined;

    const insurancePressure = lineData
      ? Math.min((node.impactScore * lineData.estimatedImpactPct) / 50, 1)
      : node.impactScore * 0.3;

    const fraudRisk = lineData ? lineData.fraudUplift * node.impactScore : 0;
    const underwritingTightening = insurancePressure > 0.4;

    // Apply playback dimming: nodes not yet active during playback should be dimmed
    let effectiveIntensity = insurancePressure;
    if (playbackFrame) {
      const activeNode = playbackFrame.activeNodes.find((n) => n.nodeId === node.nodeId);
      if (!activeNode || activeNode.activation === "idle") {
        effectiveIntensity = 0;
      } else {
        effectiveIntensity *= activeNode.currentIntensity;
      }
    }

    if (effectiveIntensity > 0.05) {
      hotspotNodes.push({
        nodeId: node.nodeId,
        label: node.label,
        lat: coord.lat,
        lng: coord.lng,
        insurancePressure: effectiveIntensity,
        fraudRisk,
        topAffectedLine: sectorLine ?? "motor",
        underwritingTightening,
      });
    }

    overlayIntensityByNode.set(node.nodeId, effectiveIntensity);
  }

  return {
    exposedLines,
    portfolioPressure,
    fraudPressure: maxFraud,
    underwritingState,
    claimsState,
    hotspotNodes,
    overlayIntensityByNode,
  };
}

/* ── Urgency Classification ── */

function lineUrgency(line: LineExposure): InsuranceUrgency {
  if (line.estimatedImpactPct >= 40) return "critical";
  if (line.estimatedImpactPct >= 25) return "elevated";
  if (line.estimatedImpactPct >= 10) return "rising";
  return "stable";
}

/* ── Urgency Colors ── */

export const URGENCY_CONFIG: Record<InsuranceUrgency, {
  color: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
}> = {
  critical: { color: "#f87171", bgClass: "bg-red-500/10", borderClass: "border-red-500/25", textClass: "text-red-400" },
  elevated: { color: "#fbbf24", bgClass: "bg-amber-500/10", borderClass: "border-amber-500/25", textClass: "text-amber-400" },
  rising:   { color: "#60a5fa", bgClass: "bg-blue-500/10", borderClass: "border-blue-500/25", textClass: "text-blue-400" },
  stable:   { color: "#94a3b8", bgClass: "bg-white/[0.03]", borderClass: "border-white/[0.08]", textClass: "text-white/40" },
};
