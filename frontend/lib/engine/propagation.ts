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
  KSA:         { energy: 1.0, aviation: 0.8, maritime: 0.7, finance: 0.9, insurance: 0.7, logistics: 0.6, government: 1.0, tourism: 0.75, utilities: 0.85, food_supply: 0.7, regulatory: 0.9, telecom: 0.6, military: 0.8, infrastructure: 0.7 },
  UAE:         { energy: 0.9, aviation: 0.95, maritime: 0.95, finance: 0.9, insurance: 0.7, logistics: 0.9, government: 0.9, tourism: 0.95, utilities: 0.85, food_supply: 0.8, regulatory: 0.85, telecom: 0.7, military: 0.7, infrastructure: 0.8 },
  Qatar:       { energy: 0.9, aviation: 0.85, maritime: 0.7, finance: 0.7, insurance: 0.5, logistics: 0.5, government: 0.8, tourism: 0.70, utilities: 0.80, food_supply: 0.65, regulatory: 0.75, telecom: 0.5, military: 0.5, infrastructure: 0.6 },
  Kuwait:      { energy: 0.8, aviation: 0.6, maritime: 0.5, finance: 0.6, insurance: 0.4, logistics: 0.4, government: 0.7, tourism: 0.40, utilities: 0.75, food_supply: 0.65, regulatory: 0.65, telecom: 0.4, military: 0.5, infrastructure: 0.5 },
  Bahrain:     { energy: 0.5, aviation: 0.5, maritime: 0.4, finance: 0.6, insurance: 0.4, logistics: 0.3, government: 0.6, tourism: 0.50, utilities: 0.65, food_supply: 0.60, regulatory: 0.60, telecom: 0.4, military: 0.3, infrastructure: 0.4 },
  Oman:        { energy: 0.6, aviation: 0.5, maritime: 0.6, finance: 0.4, insurance: 0.3, logistics: 0.4, government: 0.6, tourism: 0.55, utilities: 0.65, food_supply: 0.55, regulatory: 0.55, telecom: 0.4, military: 0.4, infrastructure: 0.5 },
  Iran:        { energy: 0.8, aviation: 0.3, maritime: 0.7, finance: 0.2, insurance: 0.1, logistics: 0.2, government: 0.5, tourism: 0.15, utilities: 0.50, food_supply: 0.40, regulatory: 0.30, telecom: 0.2, military: 0.7, infrastructure: 0.3 },
  International: { energy: 0.9, aviation: 0.5, maritime: 1.0, finance: 0.5, insurance: 0.3, logistics: 0.5, government: 0.3, tourism: 0.50, utilities: 0.60, food_supply: 0.70, regulatory: 0.40, telecom: 0.3, military: 0.2, infrastructure: 0.4 },
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

export interface SectorAggregation {
  sector: string;
  totalImpact: number;        // sum of all node impacts in sector
  maxImpact: number;          // highest single node impact
  nodeCount: number;          // nodes affected in this sector
  topNode: string;            // most impacted node label
}

export interface PropagationExplanation {
  summary: string;            // one-line causal summary
  chain: string[];            // ordered causal chain labels
  topDrivers: Array<{ nodeId: string; label: string; impact: number }>;
  confidence: number;         // 0-1 based on path depth and coverage
}

export interface PropagationResult {
  affectedNodes: NodeImpactResult[];
  topVulnerabilities: NodeImpactResult[];  // sorted desc by impact
  propagationPaths: string[][];
  totalEnergy: number;
  maxDepth: number;
  timestamp: string;
  sectorAggregation: SectorAggregation[];
  explanation: PropagationExplanation;
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
    return { affectedNodes: [], topVulnerabilities: [], propagationPaths: [], totalEnergy: 0, maxDepth: 0, timestamp: new Date().toISOString(), sectorAggregation: [], explanation: { summary: "No source node found", chain: [], topDrivers: [], confidence: 0 } };
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

    // Apply node sensitivity, damping, country-sector weight, and time decay
    // Formula: impact × node.sensitivity × (1 - node.dampingFactor) × CSW × timeDecay
    const csw = getCSW(targetNode.country, targetNode.sector);
    const nodeSens = targetNode.sensitivity ?? 0.7;
    const nodeDamp = targetNode.dampingFactor ?? 0.2;
    const decayedImpact = item.impact * nodeSens * (1 - nodeDamp) * csw * timeDecay(item.latency + hoursElapsed);
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
      // Polarity: +1 amplifies (disruption propagates), -1 dampens (stabilization reduces impact by 50%)
      const polarityMod = edge.polarity === -1 ? 0.5 : 1.0;
      queue.push({
        nodeId: edge.target_id,
        impact: finalImpact * edge.weight * edge.dependency * edge.sensitivity * polarityMod,
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

  // Sector aggregation
  const sectorAggregation = computeSectorAggregation(affectedNodes);

  // Explanation
  const explanation = computeExplanation(affectedNodes, sectorAggregation, maxDepth);

  return {
    affectedNodes,
    topVulnerabilities,
    propagationPaths,
    totalEnergy,
    maxDepth,
    timestamp: new Date().toISOString(),
    sectorAggregation,
    explanation,
  };
}

/* ── Sector Aggregation ──
   Groups affected nodes by sector and computes aggregate metrics.
   Formula: sectorImpact = Σ(nodeImpact) for all nodes in sector */

function computeSectorAggregation(affectedNodes: NodeImpactResult[]): SectorAggregation[] {
  const sectorMap = new Map<string, { total: number; max: number; count: number; topLabel: string }>();

  for (const node of affectedNodes) {
    const existing = sectorMap.get(node.sector);
    if (!existing) {
      sectorMap.set(node.sector, { total: node.impactScore, max: node.impactScore, count: 1, topLabel: node.label });
    } else {
      existing.total += node.impactScore;
      existing.count++;
      if (node.impactScore > existing.max) {
        existing.max = node.impactScore;
        existing.topLabel = node.label;
      }
    }
  }

  return Array.from(sectorMap.entries())
    .map(([sector, data]) => ({
      sector,
      totalImpact: Math.round(data.total * 1000) / 1000,
      maxImpact: Math.round(data.max * 1000) / 1000,
      nodeCount: data.count,
      topNode: data.topLabel,
    }))
    .sort((a, b) => b.totalImpact - a.totalImpact);
}

/* ── Explanation Generator ──
   Builds causal explanation from propagation results.
   Confidence = f(depth, coverage, sector spread) */

function computeExplanation(
  affectedNodes: NodeImpactResult[],
  sectorAgg: SectorAggregation[],
  maxDepth: number
): PropagationExplanation {
  // Top 5 drivers by impact
  const topDrivers = affectedNodes.slice(0, 5).map((n) => ({
    nodeId: n.nodeId,
    label: n.label,
    impact: Math.round(n.impactScore * 100) / 100,
  }));

  // Build causal chain from the highest-impact node's path
  const topNode = affectedNodes[0];
  const chain = topNode
    ? topNode.propagationPath.map((id) => {
        const node = NODE_MAP.get(id);
        return node ? node.label : id;
      })
    : [];

  // Summary: "X → Y → Z causing N% impact across K sectors"
  const sectorNames = sectorAgg.slice(0, 3).map((s) => s.sector).join(", ");
  const topImpactPct = topNode ? Math.round(topNode.impactScore * 100) : 0;
  const summary = topNode
    ? `${topNode.label} (${topImpactPct}% impact) drives cascade across ${sectorNames} — ${affectedNodes.length} entities affected at depth ${maxDepth}`
    : "No significant propagation detected";

  // Confidence formula:
  // confidence = min(1, (affectedNodes/20) × 0.3 + (maxDepth/6) × 0.3 + (sectors/5) × 0.4)
  const nodeCoverage = Math.min(affectedNodes.length / 20, 1) * 0.3;
  const depthCoverage = Math.min(maxDepth / MAX_PROPAGATION_DEPTH, 1) * 0.3;
  const sectorCoverage = Math.min(sectorAgg.length / 5, 1) * 0.4;
  const confidence = Math.round(Math.min(1, nodeCoverage + depthCoverage + sectorCoverage) * 100) / 100;

  return { summary, chain, topDrivers, confidence };
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

  const sectorAggregation = computeSectorAggregation(affectedNodes);
  const explanation = computeExplanation(affectedNodes, sectorAggregation, maxDepth);

  return {
    affectedNodes,
    topVulnerabilities: affectedNodes.slice(0, 15),
    propagationPaths: allPaths,
    totalEnergy: affectedNodes.reduce((sum, r) => sum + r.impactScore, 0),
    maxDepth,
    timestamp: new Date().toISOString(),
    sectorAggregation,
    explanation,
  };
}
