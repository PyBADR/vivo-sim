/* ── Propagation Engine ──
   Deterministic, explainable impact flow across the GCC command graph.

   Formula:
   NodeImpact(t) = SignalScore × EdgeWeight × Dependency × Sensitivity
                   × CountrySectorWeight × TimeDecay(t)

   TimeDecay(t) = e^(-λ * t)

   ConfirmedImpact = BaseImpact × (1 + CrossSourceConfirmationFactor)

   NO RANDOMNESS. Every output is traceable to inputs. */

import { ALL_GCC_EDGES, type GraphEdge } from "@/lib/map/data/gccEdges";
import { ALL_GCC_NODES, NODE_MAP, type GraphNode } from "@/lib/map/data/gccNodes";
import type { LiveSignal } from "@/lib/engine/signals";

/* ── Configuration ── */

const LAMBDA = 0.05;                          // Decay rate per hour
const MAX_PROPAGATION_DEPTH = 6;              // Max cascade steps
const MIN_IMPACT_THRESHOLD = 0.01;            // Below this, stop propagating
const CROSS_SOURCE_FACTOR = 0.15;             // Bonus per confirming signal

/* ── Country-Sector Strategic Weights ──
   How important is this country × sector combination to the GCC? */

const COUNTRY_SECTOR_WEIGHT: Record<string, Record<string, number>> = {
  KSA:         { energy: 1.0, aviation: 0.8, maritime: 0.7, finance: 0.9, insurance: 0.7, logistics: 0.6, government: 1.0 },
  UAE:         { energy: 0.9, aviation: 0.95, maritime: 0.95, finance: 0.9, insurance: 0.7, logistics: 0.9, government: 0.9 },
  Qatar:       { energy: 0.9, aviation: 0.85, maritime: 0.7, finance: 0.7, insurance: 0.5, logistics: 0.5, government: 0.8 },
  Kuwait:      { energy: 0.8, aviation: 0.6, maritime: 0.5, finance: 0.6, insurance: 0.4, logistics: 0.4, government: 0.7 },
  Bahrain:     { energy: 0.5, aviation: 0.5, maritime: 0.4, finance: 0.6, insurance: 0.4, logistics: 0.3, government: 0.6 },
  Oman:        { energy: 0.6, aviation: 0.5, maritime: 0.6, finance: 0.4, insurance: 0.3, logistics: 0.4, government: 0.6 },
  Iran:        { energy: 0.8, aviation: 0.3, maritime: 0.7, finance: 0.2, insurance: 0.1, logistics: 0.2, government: 0.5 },
  International: { energy: 0.9, aviation: 0.5, maritime: 1.0, finance: 0.5, insurance: 0.3, logistics: 0.5, government: 0.3 },
};

function getCSW(country: string, sector: string): number {
  return COUNTRY_SECTOR_WEIGHT[country]?.[sector] ?? 0.5;
}

/* ── Time Decay ── */
export function timeDecay(hoursElapsed: number): number {
  return Math.exp(-LAMBDA * hoursElapsed);
}

/* ── Impact Result Types ── */

export interface NodeImpactResult {
  nodeId: string;
  label: string;
  country: string;
  sector: string;
  impactScore: number;      // 0-1
  propagationPath: string[];  // [source, ..., this_node]
  depth: number;
  latencyHours: number;
  edgeTypes: string[];
  confirmedBy: number;      // number of confirming signals
}

export interface PropagationResult {
  affectedNodes: NodeImpactResult[];
  topVulnerabilities: NodeImpactResult[];  // sorted desc by impact
  propagationPaths: string[][];
  totalEnergy: number;
  maxDepth: number;
  timestamp: string;
}

/* ── Core Propagation ── */

export function propagate(
  sourceNodeId: string,
  signalScore: number,
  hoursElapsed = 0,
  confirmingSignals = 0
): PropagationResult {
  const results = new Map<string, NodeImpactResult>();
  const visited = new Set<string>();

  // BFS propagation
  const queue: Array<{
    nodeId: string;
    impact: number;
    path: string[];
    depth: number;
    latency: number;
    edgeTypes: string[];
  }> = [];

  // Seed the source
  const sourceNode = NODE_MAP.get(sourceNodeId);
  if (!sourceNode) {
    return { affectedNodes: [], topVulnerabilities: [], propagationPaths: [], totalEnergy: 0, maxDepth: 0, timestamp: new Date().toISOString() };
  }

  const sourceCSW = getCSW(sourceNode.country, sourceNode.sector);
  const sourceImpact = signalScore * sourceCSW * timeDecay(hoursElapsed);
  const confirmedImpact = sourceImpact * (1 + CROSS_SOURCE_FACTOR * confirmingSignals);

  results.set(sourceNodeId, {
    nodeId: sourceNodeId,
    label: sourceNode.label,
    country: sourceNode.country,
    sector: sourceNode.sector,
    impactScore: Math.min(confirmedImpact, 1),
    propagationPath: [sourceNodeId],
    depth: 0,
    latencyHours: 0,
    edgeTypes: [],
    confirmedBy: confirmingSignals,
  });
  visited.add(sourceNodeId);

  // Find outgoing edges from source
  const outEdges = ALL_GCC_EDGES.filter((e) => e.source_id === sourceNodeId);
  for (const edge of outEdges) {
    queue.push({
      nodeId: edge.target_id,
      impact: confirmedImpact * edge.weight * edge.dependency * edge.sensitivity,
      path: [sourceNodeId, edge.target_id],
      depth: 1,
      latency: edge.latency_hours,
      edgeTypes: [edge.edge_type],
    });
  }

  // BFS
  let maxDepth = 0;
  while (queue.length > 0) {
    const item = queue.shift()!;
    if (item.depth > MAX_PROPAGATION_DEPTH) continue;
    if (item.impact < MIN_IMPACT_THRESHOLD) continue;

    const targetNode = NODE_MAP.get(item.nodeId);
    if (!targetNode) continue;

    // Apply country-sector weight and time decay
    const csw = getCSW(targetNode.country, targetNode.sector);
    const decayedImpact = item.impact * csw * timeDecay(item.latency + hoursElapsed);
    const finalImpact = Math.min(decayedImpact, 1);

    if (finalImpact < MIN_IMPACT_THRESHOLD) continue;

    // Update if new or higher impact
    const existing = results.get(item.nodeId);
    if (!existing || existing.impactScore < finalImpact) {
      results.set(item.nodeId, {
        nodeId: item.nodeId,
        label: targetNode.label,
        country: targetNode.country,
        sector: targetNode.sector,
        impactScore: finalImpact,
        propagationPath: item.path,
        depth: item.depth,
        latencyHours: item.latency,
        edgeTypes: item.edgeTypes,
        confirmedBy: 0,
      });
    }

    maxDepth = Math.max(maxDepth, item.depth);

    // Continue propagation if not visited at this depth
    const visitKey = `${item.nodeId}@${item.depth}`;
    if (visited.has(visitKey)) continue;
    visited.add(visitKey);

    const nextEdges = ALL_GCC_EDGES.filter((e) => e.source_id === item.nodeId);
    for (const edge of nextEdges) {
      if (item.path.includes(edge.target_id)) continue; // No cycles
      queue.push({
        nodeId: edge.target_id,
        impact: finalImpact * edge.weight * edge.dependency * edge.sensitivity,
        path: [...item.path, edge.target_id],
        depth: item.depth + 1,
        latency: item.latency + edge.latency_hours,
        edgeTypes: [...item.edgeTypes, edge.edge_type],
      });
    }
  }

  const affectedNodes = Array.from(results.values())
    .filter((r) => r.impactScore >= MIN_IMPACT_THRESHOLD)
    .sort((a, b) => b.impactScore - a.impactScore);

  const topVulnerabilities = affectedNodes.slice(0, 15);
  const propagationPaths = affectedNodes.map((r) => r.propagationPath);
  const totalEnergy = affectedNodes.reduce((sum, r) => sum + r.impactScore, 0);

  return {
    affectedNodes,
    topVulnerabilities,
    propagationPaths,
    totalEnergy,
    maxDepth,
    timestamp: new Date().toISOString(),
  };
}

/* ── Multi-Signal Propagation ──
   Process multiple signals, merge results, apply confirmation bonuses. */

export function propagateMultiSignal(
  signals: Array<{ nodeId: string; score: number; hoursElapsed: number }>
): PropagationResult {
  const merged = new Map<string, NodeImpactResult>();
  let maxDepth = 0;
  const allPaths: string[][] = [];

  // Count confirming signals per node
  const signalsByNode = new Map<string, number>();
  for (const s of signals) {
    signalsByNode.set(s.nodeId, (signalsByNode.get(s.nodeId) ?? 0) + 1);
  }

  for (const signal of signals) {
    const confirming = (signalsByNode.get(signal.nodeId) ?? 1) - 1;
    const result = propagate(signal.nodeId, signal.score, signal.hoursElapsed, confirming);
    maxDepth = Math.max(maxDepth, result.maxDepth);

    for (const node of result.affectedNodes) {
      const existing = merged.get(node.nodeId);
      if (!existing || existing.impactScore < node.impactScore) {
        merged.set(node.nodeId, node);
      }
    }
    allPaths.push(...result.propagationPaths);
  }

  const affectedNodes = Array.from(merged.values()).sort(
    (a, b) => b.impactScore - a.impactScore
  );

  return {
    affectedNodes,
    topVulnerabilities: affectedNodes.slice(0, 15),
    propagationPaths: allPaths,
    totalEnergy: affectedNodes.reduce((sum, r) => sum + r.impactScore, 0),
    maxDepth,
    timestamp: new Date().toISOString(),
  };
}
