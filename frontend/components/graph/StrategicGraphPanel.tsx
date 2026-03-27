"use client";

import { useState } from "react";
import type { NodeImpact, PropagationStep } from "@/lib/types/crisis";
import { getRiskBand, RISK_COLORS } from "@/lib/config/crisis-visuals";

interface Props {
  nodes?: NodeImpact[];
  propagation?: PropagationStep[];
}

const GRAPH_POSITIONS: Record<string, { x: number; y: number }> = {
  event_escalation: { x: 300, y: 40 },
  country_usa: { x: 120, y: 100 },
  country_iran: { x: 480, y: 100 },
  energy_oil: { x: 200, y: 200 },
  energy_fuel: { x: 400, y: 200 },
  airport_kwi: { x: 80, y: 310 },
  airport_ruh: { x: 180, y: 340 },
  airport_dxb: { x: 360, y: 310 },
  airport_doh: { x: 440, y: 340 },
  airport_jed: { x: 130, y: 400 },
  trade_crossborder: { x: 300, y: 300 },
  social_panic: { x: 520, y: 280 },
  chokepoint_hormuz: { x: 300, y: 160 },
  market_gcc: { x: 500, y: 400 },
};

export function StrategicGraphPanel({ nodes, propagation }: Props) {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const lastStep = propagation?.[propagation.length - 1];
  const nodeScores = lastStep?.node_scores ?? {};

  const getNodeColor = (nodeId: string) => {
    const score = nodeScores[nodeId] ?? 0;
    return RISK_COLORS[getRiskBand(score)];
  };

  const getNodeRadius = (nodeId: string) => {
    const score = nodeScores[nodeId] ?? 0;
    return 8 + score * 14;
  };

  const selectedInfo = nodes?.find((n) => n.node_id === selectedNode);

  return (
    <div className="rounded-3xl border border-white/10 bg-black/40 p-5">
      <div className="mb-4">
        <p className="text-xs uppercase tracking-[0.3em] text-white/40">
          Graph Intelligence
        </p>
        <h3 className="mt-2 text-xl font-semibold text-white">
          Strategic Entity Graph
        </h3>
      </div>

      <div className="overflow-hidden rounded-3xl border border-blue-500/10 bg-[radial-gradient(circle_at_center,_rgba(59,130,246,0.08),_transparent_50%)]">
        <svg viewBox="0 0 600 460" className="h-[420px] w-full">
          <rect width="600" height="460" fill="transparent" />

          {/* Edges — simplified connections */}
          {[
            ["event_escalation", "country_usa"],
            ["event_escalation", "country_iran"],
            ["country_iran", "energy_oil"],
            ["energy_oil", "energy_fuel"],
            ["energy_oil", "chokepoint_hormuz"],
            ["chokepoint_hormuz", "trade_crossborder"],
            ["energy_fuel", "airport_dxb"],
            ["energy_fuel", "airport_kwi"],
            ["trade_crossborder", "airport_ruh"],
            ["trade_crossborder", "airport_doh"],
            ["social_panic", "market_gcc"],
            ["event_escalation", "social_panic"],
          ].map(([from, to]) => {
            const p1 = GRAPH_POSITIONS[from];
            const p2 = GRAPH_POSITIONS[to];
            if (!p1 || !p2) return null;
            return (
              <line
                key={`${from}-${to}`}
                x1={p1.x}
                y1={p1.y}
                x2={p2.x}
                y2={p2.y}
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="1"
              />
            );
          })}

          {/* Nodes */}
          {Object.entries(GRAPH_POSITIONS).map(([id, pos]) => (
            <g
              key={id}
              className="cursor-pointer"
              onClick={() => setSelectedNode(selectedNode === id ? null : id)}
            >
              <circle
                cx={pos.x}
                cy={pos.y}
                r={getNodeRadius(id)}
                fill={getNodeColor(id)}
                opacity={selectedNode === id ? 1 : 0.7}
                stroke={selectedNode === id ? "white" : "transparent"}
                strokeWidth={2}
              />
              <text
                x={pos.x}
                y={pos.y + getNodeRadius(id) + 14}
                fill="white"
                fontSize="9"
                textAnchor="middle"
                opacity="0.6"
              >
                {id.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()).slice(0, 18)}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* Selected Node Details */}
      {selectedInfo && (
        <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">{selectedInfo.label}</p>
              <p className="text-xs text-white/40">{selectedInfo.node_type} {selectedInfo.country ? `· ${selectedInfo.country}` : ""}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-blue-300">
                {selectedInfo.severity_score.toFixed(2)}
              </p>
              <p className="text-xs text-white/40">severity</p>
            </div>
          </div>
          {selectedInfo.ripple_effect.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {selectedInfo.ripple_effect.map((effect) => (
                <span
                  key={effect}
                  className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[10px] text-white/60"
                >
                  {effect}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
