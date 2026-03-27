/* ── Dependency Arcs Layer ──
   Renders animated arcs between nodes during propagation playback.
   Arcs pulse in the direction of propagation, intensity = impact carried. */

"use client";

import { useMemo } from "react";
import type { EdgeVisualState } from "@/lib/visualization/propagationPlayback";
import type { GeoNode } from "@/lib/types/controlRoom";

interface DependencyArcsProps {
  edges: EdgeVisualState[];
  nodes: GeoNode[];
  project: (lat: number, lng: number) => [number, number];
}

export function DependencyArcsLayer({ edges, nodes, project }: DependencyArcsProps) {
  const nodeMap = useMemo(() => {
    const map = new Map<string, GeoNode>();
    for (const n of nodes) map.set(n.id, n);
    return map;
  }, [nodes]);

  if (edges.length === 0) return null;

  return (
    <g className="dependency-arcs-layer">
      {edges.map((edge) => {
        const sourceNode = nodeMap.get(edge.sourceId);
        const targetNode = nodeMap.get(edge.targetId);
        if (!sourceNode || !targetNode) return null;

        const [x1, y1] = project(sourceNode.coord.lat, sourceNode.coord.lng);
        const [x2, y2] = project(targetNode.coord.lat, targetNode.coord.lng);
        const midX = (x1 + x2) / 2;
        const midY = Math.min(y1, y2) - 25;
        const pathD = `M ${x1} ${y1} Q ${midX} ${midY} ${x2} ${y2}`;

        const color =
          edge.activation === "stressed"
            ? `rgba(248,113,113,${0.3 + edge.flowIntensity * 0.5})`
            : `rgba(96,165,250,${0.2 + edge.flowIntensity * 0.4})`;

        const dashOffset = (1 - edge.flowProgress) * 200;

        return (
          <g key={`arc-${edge.sourceId}-${edge.targetId}`}>
            {/* Base arc (faint) */}
            <path
              d={pathD}
              fill="none"
              stroke={color}
              strokeWidth={edge.activation === "stressed" ? 1.5 : 1}
              strokeDasharray="6 3"
              strokeDashoffset={dashOffset}
              opacity={edge.flowIntensity * 0.8}
            />
            {/* Flow indicator dot */}
            {edge.flowProgress > 0 && edge.flowProgress < 1 && (
              <circle
                cx={x1 + (x2 - x1) * edge.flowProgress}
                cy={y1 + (y2 - y1) * edge.flowProgress - 25 * Math.sin(edge.flowProgress * Math.PI)}
                r={2.5}
                fill={edge.activation === "stressed" ? "#f87171" : "#60a5fa"}
                opacity={edge.flowIntensity}
              >
                <animate
                  attributeName="r"
                  from="2"
                  to="4"
                  dur="0.8s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  from={String(edge.flowIntensity)}
                  to={String(edge.flowIntensity * 0.3)}
                  dur="0.8s"
                  repeatCount="indefinite"
                />
              </circle>
            )}
          </g>
        );
      })}
    </g>
  );
}
