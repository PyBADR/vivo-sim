/* ── Propagation Playback Visualization Model ──
   Consumes the propagation engine output and produces
   time-ordered visual states for the globe and all panels.

   The model computes:
   - Which nodes are active at each timestep
   - Which edges are pulsing at each timestep
   - Where impact rings should expand
   - What the decision state should be at each timestep

   NO RANDOMNESS. All visual states derived deterministically
   from propagation output + time position. */

import type { PropagationResult, NodeImpactResult } from "@/lib/engine/propagation";
import type { InsuranceExposureResult } from "@/lib/engine/insurance";
import type { DecisionOutput } from "@/lib/engine/decisionEngine";

/* ── Node Activation States ── */

export type NodeActivationState =
  | "idle"        // No impact, default appearance
  | "detected"    // Signal received, initial glow
  | "impacted"    // Propagation reached, medium intensity
  | "critical"    // Impact >= 0.7, pulsing red
  | "decaying"    // Past peak, fading
  | "selected";   // User-selected, blue outline

export interface NodeVisualState {
  nodeId: string;
  activation: NodeActivationState;
  impactScore: number;        // 0-1, drives intensity
  activationTime: number;     // Normalized time (0-1) when node first activates
  peakTime: number;           // When impact is highest
  currentIntensity: number;   // Current visual intensity (0-1)
  ringRadius: number;         // Impact ring expansion radius (0 = no ring)
  label: string;
  depth: number;              // Propagation depth from source
}

/* ── Edge Visual States ── */

export type EdgeActivationState =
  | "idle"        // No flow
  | "pulsing"     // Active propagation flowing along edge
  | "stressed"    // High impact flowing
  | "disrupted";  // Edge represents a disrupted route

export interface EdgeVisualState {
  sourceId: string;
  targetId: string;
  activation: EdgeActivationState;
  flowIntensity: number;      // 0-1
  activationTime: number;     // When edge starts pulsing
  flowProgress: number;       // 0-1, animated position along edge
  impactCarried: number;      // Impact being transmitted
}

/* ── Impact Ring ── */

export interface ImpactRing {
  nodeId: string;
  lat: number;
  lng: number;
  radius: number;             // Current radius in km
  maxRadius: number;          // Max expansion radius
  intensity: number;          // Current opacity/intensity
  startTime: number;          // Normalized start time
  color: "red" | "amber" | "blue";
}

/* ── Playback Frame ── */

export interface PlaybackFrame {
  frameIndex: number;
  normalizedTime: number;     // 0-1 across total playback
  hoursElapsed: number;
  activeNodes: NodeVisualState[];
  activeEdges: EdgeVisualState[];
  impactRings: ImpactRing[];
  affectedCount: number;
  totalEnergy: number;
  maxImpact: number;
  currentDecision: "hold" | "escalate" | "activate_response" | "emergency_protocol";
  insurancePressure: number;  // 0-1
}

/* ── Playback Configuration ── */

export interface PlaybackConfig {
  totalFrames: number;           // Default 120 (2 seconds at 60fps)
  totalHours: number;            // Real-world hours the propagation covers
  impactRingMaxRadiusKm: number; // Max ring expansion
  impactRingDurationFrames: number;
  edgePulseDurationFrames: number;
  nodeActivationRampFrames: number;
  decayStartFraction: number;    // When decay begins (0.7 = 70% through)
}

export const DEFAULT_PLAYBACK_CONFIG: PlaybackConfig = {
  totalFrames: 180,              // 3 seconds at 60fps
  totalHours: 72,
  impactRingMaxRadiusKm: 200,
  impactRingDurationFrames: 45,
  edgePulseDurationFrames: 20,
  nodeActivationRampFrames: 15,
  decayStartFraction: 0.75,
};

/* ── Build Playback Frames ──
   Takes a PropagationResult and produces an ordered array of PlaybackFrames.
   Each frame is a complete snapshot of the visual state at that time. */

export function buildPlaybackFrames(
  propagation: PropagationResult,
  nodeCoords: Map<string, { lat: number; lng: number }>,
  config: PlaybackConfig = DEFAULT_PLAYBACK_CONFIG
): PlaybackFrame[] {
  const { totalFrames, totalHours } = config;
  const { affectedNodes, propagationPaths } = propagation;

  if (affectedNodes.length === 0) return [];

  // Compute max latency for time normalization
  const maxLatency = Math.max(
    ...affectedNodes.map((n) => n.latencyHours),
    1
  );

  // Pre-compute activation times for each node (normalized 0-1)
  const nodeActivationMap = new Map<string, {
    activationTime: number;
    peakTime: number;
    impact: NodeImpactResult;
  }>();

  for (const node of affectedNodes) {
    const activationNorm = node.latencyHours / maxLatency;
    // Peak is slightly after activation
    const peakNorm = Math.min(activationNorm + 0.1, 1);
    nodeActivationMap.set(node.nodeId, {
      activationTime: activationNorm,
      peakTime: peakNorm,
      impact: node,
    });
  }

  // Pre-compute edge activation from propagation paths
  const edgeActivations: Array<{
    sourceId: string;
    targetId: string;
    activationTime: number;
    impact: number;
  }> = [];

  for (const path of propagationPaths) {
    for (let i = 0; i < path.length - 1; i++) {
      const sourceId = path[i];
      const targetId = path[i + 1];
      const targetData = nodeActivationMap.get(targetId);
      if (targetData) {
        edgeActivations.push({
          sourceId,
          targetId,
          activationTime: Math.max(targetData.activationTime - 0.05, 0),
          impact: targetData.impact.impactScore,
        });
      }
    }
  }

  // De-duplicate edges (keep highest impact)
  const edgeMap = new Map<string, typeof edgeActivations[0]>();
  for (const ea of edgeActivations) {
    const key = `${ea.sourceId}->${ea.targetId}`;
    const existing = edgeMap.get(key);
    if (!existing || existing.impact < ea.impact) {
      edgeMap.set(key, ea);
    }
  }
  const uniqueEdges = Array.from(edgeMap.values());

  // Generate frames
  const frames: PlaybackFrame[] = [];

  for (let f = 0; f < totalFrames; f++) {
    const t = f / (totalFrames - 1); // 0-1
    const hoursElapsed = t * totalHours;

    // Compute node states at this time
    const activeNodes: NodeVisualState[] = [];
    for (const [nodeId, data] of Array.from(nodeActivationMap.entries())) {
      const { activationTime, peakTime, impact } = data;

      if (t < activationTime - 0.02) continue; // Not yet activated (with slight buffer)

      // Compute current intensity
      let intensity: number;
      let activation: NodeActivationState;
      let ringRadius = 0;

      if (t < activationTime) {
        // Pre-activation: detected state
        intensity = 0.2;
        activation = "detected";
      } else if (t < peakTime) {
        // Ramping up to peak
        const rampProgress = (t - activationTime) / Math.max(peakTime - activationTime, 0.01);
        intensity = impact.impactScore * easeOutCubic(rampProgress);
        activation = intensity >= 0.7 ? "critical" : "impacted";
      } else if (t < config.decayStartFraction) {
        // At peak
        intensity = impact.impactScore;
        activation = intensity >= 0.7 ? "critical" : "impacted";
      } else {
        // Decaying
        const decayProgress = (t - config.decayStartFraction) / (1 - config.decayStartFraction);
        intensity = impact.impactScore * (1 - decayProgress * 0.4); // Decay to 60% of peak
        activation = "decaying";
      }

      // Impact ring: expands from activation to activation + ringDuration
      const ringStartT = activationTime;
      const ringEndT = activationTime + (config.impactRingDurationFrames / totalFrames);
      if (t >= ringStartT && t <= ringEndT && impact.impactScore >= 0.3) {
        const ringProgress = (t - ringStartT) / (ringEndT - ringStartT);
        ringRadius = ringProgress * config.impactRingMaxRadiusKm * impact.impactScore;
      }

      const coord = nodeCoords.get(nodeId);
      activeNodes.push({
        nodeId,
        activation,
        impactScore: impact.impactScore,
        activationTime,
        peakTime,
        currentIntensity: Math.max(intensity, 0),
        ringRadius,
        label: impact.label,
        depth: impact.depth,
      });

    }

    // Compute edge states at this time
    const activeEdges: EdgeVisualState[] = [];
    for (const edge of uniqueEdges) {
      const edgeEndT = edge.activationTime + (config.edgePulseDurationFrames / totalFrames);
      if (t < edge.activationTime || t > edgeEndT + 0.1) continue;

      const flowProgress = Math.min(
        (t - edge.activationTime) / (config.edgePulseDurationFrames / totalFrames),
        1
      );
      const flowIntensity = edge.impact * (1 - Math.max(0, flowProgress - 0.8) * 5); // Fade at end

      activeEdges.push({
        sourceId: edge.sourceId,
        targetId: edge.targetId,
        activation: edge.impact >= 0.6 ? "stressed" : "pulsing",
        flowIntensity: Math.max(flowIntensity, 0),
        activationTime: edge.activationTime,
        flowProgress,
        impactCarried: edge.impact,
      });
    }

    // Compute impact rings
    const impactRings: ImpactRing[] = [];
    for (const nodeState of activeNodes) {
      if (nodeState.ringRadius > 0) {
        const coord = nodeCoords.get(nodeState.nodeId);
        if (coord) {
          impactRings.push({
            nodeId: nodeState.nodeId,
            lat: coord.lat,
            lng: coord.lng,
            radius: nodeState.ringRadius,
            maxRadius: config.impactRingMaxRadiusKm * nodeState.impactScore,
            intensity: (1 - nodeState.ringRadius / (config.impactRingMaxRadiusKm * nodeState.impactScore + 0.01)) * 0.6,
            startTime: nodeState.activationTime,
            color: nodeState.impactScore >= 0.7 ? "red" : nodeState.impactScore >= 0.4 ? "amber" : "blue",
          });
        }
      }
    }

    // Aggregate stats
    const totalEnergy = activeNodes.reduce((s, n) => s + n.currentIntensity, 0);
    const maxImpact = activeNodes.length > 0
      ? Math.max(...activeNodes.map((n) => n.currentIntensity))
      : 0;

    // Decision state from current max impact
    let currentDecision: PlaybackFrame["currentDecision"] = "hold";
    if (maxImpact >= 0.80) currentDecision = "emergency_protocol";
    else if (maxImpact >= 0.55) currentDecision = "activate_response";
    else if (maxImpact >= 0.30) currentDecision = "escalate";

    // Insurance pressure: weighted by count * average impact
    const avgImpact = activeNodes.length > 0
      ? totalEnergy / activeNodes.length
      : 0;
    const insurancePressure = Math.min(avgImpact * (activeNodes.length / affectedNodes.length), 1);

    frames.push({
      frameIndex: f,
      normalizedTime: t,
      hoursElapsed,
      activeNodes,
      activeEdges,
      impactRings,
      affectedCount: activeNodes.filter((n) => n.activation !== "idle").length,
      totalEnergy,
      maxImpact,
      currentDecision,
      insurancePressure,
    });
  }

  return frames;
}

/* ── Easing Functions ── */

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

/* ── Color Utilities ── */

export function activationColor(state: NodeActivationState, intensity: number): string {
  switch (state) {
    case "idle":
      return "rgba(255,255,255,0.15)";
    case "detected":
      return `rgba(96,165,250,${0.3 + intensity * 0.3})`;  // Blue glow
    case "impacted":
      return `rgba(251,191,36,${0.4 + intensity * 0.4})`;  // Amber
    case "critical":
      return `rgba(248,113,113,${0.6 + intensity * 0.4})`; // Red
    case "decaying":
      return `rgba(148,163,184,${0.2 + intensity * 0.3})`; // Gray-blue fade
    case "selected":
      return `rgba(59,130,246,${0.7 + intensity * 0.3})`;  // Blue highlight
    default:
      return "rgba(255,255,255,0.15)";
  }
}

export function edgeColor(state: EdgeActivationState, intensity: number): string {
  switch (state) {
    case "idle":
      return "rgba(255,255,255,0.05)";
    case "pulsing":
      return `rgba(96,165,250,${0.2 + intensity * 0.4})`;
    case "stressed":
      return `rgba(248,113,113,${0.3 + intensity * 0.5})`;
    case "disrupted":
      return `rgba(248,113,113,${0.5 + intensity * 0.3})`;
    default:
      return "rgba(255,255,255,0.05)";
  }
}

export function ringColor(color: ImpactRing["color"]): string {
  switch (color) {
    case "red": return "rgba(248,113,113,0.3)";
    case "amber": return "rgba(251,191,36,0.25)";
    case "blue": return "rgba(96,165,250,0.2)";
  }
}

/* ── Get Frame at Normalized Time ── */

export function getFrameAtTime(
  frames: PlaybackFrame[],
  normalizedTime: number
): PlaybackFrame | null {
  if (frames.length === 0) return null;
  const index = Math.round(normalizedTime * (frames.length - 1));
  return frames[Math.max(0, Math.min(index, frames.length - 1))];
}
