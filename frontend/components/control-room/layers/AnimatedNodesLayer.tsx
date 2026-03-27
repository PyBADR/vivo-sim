/* ── Animated Nodes Layer ──
   Renders nodes with 6 visual activation states:
   idle / detected / impacted / critical / decaying / selected

   Node appearance changes based on propagation playback time. */

"use client";

import type { NodeVisualState, NodeActivationState } from "@/lib/visualization/propagationPlayback";
import { activationColor } from "@/lib/visualization/propagationPlayback";

interface AnimatedNodesProps {
  nodes: NodeVisualState[];
  selectedNodeId: string | null;
  onNodeClick: (id: string) => void;
  project: (lat: number, lng: number) => [number, number];
  nodeCoords: Map<string, { lat: number; lng: number }>;
}

function nodeRadius(activation: NodeActivationState, impact: number): number {
  switch (activation) {
    case "critical": return 7 + impact * 3;
    case "impacted": return 5 + impact * 2;
    case "detected": return 4;
    case "decaying": return 4 + impact;
    case "selected": return 8;
    case "idle":
    default: return 3;
  }
}

export function AnimatedNodesLayer({
  nodes,
  selectedNodeId,
  onNodeClick,
  project,
  nodeCoords,
}: AnimatedNodesProps) {
  if (nodes.length === 0) return null;

  return (
    <g className="animated-nodes-layer">
      {nodes.map((node) => {
        const coord = nodeCoords.get(node.nodeId);
        if (!coord) return null;

        const [cx, cy] = project(coord.lat, coord.lng);
        const isSelected = node.nodeId === selectedNodeId;
        const activation = isSelected ? "selected" : node.activation;
        const radius = nodeRadius(activation, node.currentIntensity);
        const fill = activationColor(activation, node.currentIntensity);

        return (
          <g
            key={node.nodeId}
            onClick={() => onNodeClick(node.nodeId)}
            style={{ cursor: "pointer" }}
          >
            {/* Pulse ring for critical nodes */}
            {activation === "critical" && (
              <circle
                cx={cx}
                cy={cy}
                r={radius + 4}
                fill="none"
                stroke="rgba(248,113,113,0.4)"
                strokeWidth={0.8}
              >
                <animate
                  attributeName="r"
                  from={String(radius + 2)}
                  to={String(radius + 12)}
                  dur="1.5s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  from="0.5"
                  to="0"
                  dur="1.5s"
                  repeatCount="indefinite"
                />
              </circle>
            )}

            {/* Detection glow for detected nodes */}
            {activation === "detected" && (
              <circle
                cx={cx}
                cy={cy}
                r={radius + 3}
                fill="none"
                stroke="rgba(96,165,250,0.3)"
                strokeWidth={0.5}
              >
                <animate
                  attributeName="opacity"
                  from="0.3"
                  to="0.1"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </circle>
            )}

            {/* Selection ring */}
            {isSelected && (
              <circle
                cx={cx}
                cy={cy}
                r={radius + 3}
                fill="none"
                stroke="#3b82f6"
                strokeWidth={1.5}
              />
            )}

            {/* Node circle */}
            <circle
              cx={cx}
              cy={cy}
              r={radius}
              fill={fill}
              opacity={0.9}
            />

            {/* Label */}
            <text
              x={cx}
              y={cy - radius - 4}
              textAnchor="middle"
              fill={`rgba(255,255,255,${activation === "idle" ? 0.3 : 0.6})`}
              fontSize={activation === "critical" ? 9 : 7.5}
              fontFamily="system-ui"
              fontWeight={activation === "critical" ? 600 : 400}
            >
              {node.label}
            </text>

            {/* Impact score badge for impacted/critical nodes */}
            {(activation === "impacted" || activation === "critical") && node.currentIntensity > 0.3 && (
              <text
                x={cx + radius + 3}
                y={cy + 3}
                fill="rgba(255,255,255,0.5)"
                fontSize={7}
                fontFamily="system-ui"
              >
                {Math.round(node.currentIntensity * 100)}%
              </text>
            )}
          </g>
        );
      })}
    </g>
  );
}
