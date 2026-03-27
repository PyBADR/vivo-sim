/* ── Impact Rings Layer ──
   Expanding concentric rings at node locations when first impacted.
   Radius expands from 0 → maxRadius, opacity fades as ring expands. */

"use client";

import type { ImpactRing } from "@/lib/visualization/propagationPlayback";

interface ImpactRingsProps {
  rings: ImpactRing[];
  project: (lat: number, lng: number) => [number, number];
  scale?: number; // pixels per km
}

const RING_COLORS = {
  red: "rgba(248,113,113,",
  amber: "rgba(251,191,36,",
  blue: "rgba(96,165,250,",
};

export function ImpactRingsLayer({ rings, project, scale = 0.15 }: ImpactRingsProps) {
  if (rings.length === 0) return null;

  return (
    <g className="impact-rings-layer">
      {rings.map((ring) => {
        const [cx, cy] = project(ring.lat, ring.lng);
        const radiusPx = ring.radius * scale;
        const maxRadiusPx = ring.maxRadius * scale;
        const colorBase = RING_COLORS[ring.color] || RING_COLORS.blue;

        return (
          <g key={`ring-${ring.nodeId}`}>
            {/* Outer expanding ring */}
            <circle
              cx={cx}
              cy={cy}
              r={radiusPx}
              fill="none"
              stroke={`${colorBase}${ring.intensity * 0.6})`}
              strokeWidth={1}
            />
            {/* Inner ring (half radius, higher opacity) */}
            <circle
              cx={cx}
              cy={cy}
              r={radiusPx * 0.5}
              fill={`${colorBase}${ring.intensity * 0.1})`}
              stroke={`${colorBase}${ring.intensity * 0.3})`}
              strokeWidth={0.5}
            />
            {/* Center glow */}
            {ring.intensity > 0.2 && (
              <circle
                cx={cx}
                cy={cy}
                r={3}
                fill={`${colorBase}${Math.min(ring.intensity, 0.5)})`}
              />
            )}
          </g>
        );
      })}
    </g>
  );
}
