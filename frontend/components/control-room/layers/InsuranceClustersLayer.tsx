"use client";

/* ── Insurance Clusters Map Layer ──
   SVG overlay showing insurance hotspot nodes on the globe map.
   Playback-reactive: nodes appear/grow as propagation reaches them.
   Fraud nodes get a distinctive red halo. Underwriting-tightening nodes show amber border. */

import type { InsuranceHotspotNode } from "@/lib/insurance/insuranceVisualization";

interface Props {
  hotspots: InsuranceHotspotNode[];
  project: (lat: number, lng: number) => [number, number];
}

export function InsuranceClustersLayer({ hotspots, project }: Props) {
  if (hotspots.length === 0) return null;

  return (
    <g className="insurance-clusters-layer">
      {hotspots.map((node) => {
        const [cx, cy] = project(node.lat, node.lng);
        const radius = 4 + node.insurancePressure * 12;
        const opacity = 0.3 + node.insurancePressure * 0.5;

        // Fraud risk → red outer ring
        const showFraudHalo = node.fraudRisk > 0.2;
        // Underwriting tightening → amber dashed border
        const showUWBorder = node.underwritingTightening;

        // Color based on pressure
        const fillColor = node.insurancePressure >= 0.7
          ? "rgba(248,113,113,0.35)"
          : node.insurancePressure >= 0.4
          ? "rgba(251,191,36,0.3)"
          : "rgba(96,165,250,0.25)";

        const strokeColor = showUWBorder
          ? "rgba(251,191,36,0.6)"
          : node.insurancePressure >= 0.7
          ? "rgba(248,113,113,0.4)"
          : "rgba(96,165,250,0.2)";

        return (
          <g key={node.nodeId}>
            {/* Pressure halo */}
            <circle
              cx={cx}
              cy={cy}
              r={radius + 6}
              fill="none"
              stroke={fillColor}
              strokeWidth={0.5}
              opacity={opacity * 0.5}
            >
              <animate
                attributeName="r"
                from={String(radius + 3)}
                to={String(radius + 14)}
                dur="3s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                from={String(opacity * 0.5)}
                to="0"
                dur="3s"
                repeatCount="indefinite"
              />
            </circle>

            {/* Fraud risk red halo */}
            {showFraudHalo && (
              <circle
                cx={cx}
                cy={cy}
                r={radius + 3}
                fill="none"
                stroke="rgba(248,113,113,0.5)"
                strokeWidth={1}
                strokeDasharray="2 2"
                opacity={0.6}
              >
                <animate
                  attributeName="stroke-dashoffset"
                  from="0"
                  to="8"
                  dur="1.5s"
                  repeatCount="indefinite"
                />
              </circle>
            )}

            {/* Main circle */}
            <circle
              cx={cx}
              cy={cy}
              r={radius}
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={showUWBorder ? 1.5 : 0.8}
              strokeDasharray={showUWBorder ? "3 1.5" : "none"}
              opacity={opacity}
            />

            {/* Center dot */}
            <circle
              cx={cx}
              cy={cy}
              r={2}
              fill={node.insurancePressure >= 0.6 ? "#f87171" : "#fbbf24"}
              opacity={0.8}
            />

            {/* Label */}
            {node.insurancePressure >= 0.3 && (
              <text
                x={cx}
                y={cy - radius - 3}
                textAnchor="middle"
                fill="rgba(251,191,36,0.6)"
                fontSize={7}
                fontFamily="system-ui"
              >
                {Math.round(node.insurancePressure * 100)}%
              </text>
            )}
          </g>
        );
      })}
    </g>
  );
}
