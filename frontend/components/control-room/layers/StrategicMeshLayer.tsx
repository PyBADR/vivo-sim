"use client";

/* ── Strategic Mesh Layer ──
   Renders the strategic network mesh connecting critical GCC infrastructure.
   Shows interconnections between airports, ports, oil facilities, and exchanges
   to visualize cascading failure paths and dependency chains. */

import { useMemo } from "react";
import { useControlRoomStore } from "@/lib/state/controlRoomStore";
import type { GeoNode, GeoRoute } from "@/lib/types/controlRoom";

export interface MeshEdge {
  from: GeoNode;
  to: GeoNode;
  weight: number;     // combined severity
  cascadeRisk: number; // probability of cascade propagation
}

export function useStrategicMeshLayer(): MeshEdge[] {
  const { state } = useControlRoomStore();
  const { geoNodes } = state;

  return useMemo(() => {
    const edges: MeshEdge[] = [];
    const activeNodes = geoNodes.filter((n) => n.severity > 0.2);

    // Build mesh: connect nodes within same country or adjacent types
    for (let i = 0; i < activeNodes.length; i++) {
      for (let j = i + 1; j < activeNodes.length; j++) {
        const a = activeNodes[i];
        const b = activeNodes[j];

        // Connect if same country or cross-type dependency
        const sameCountry = a.country === b.country;
        const crossType =
          (a.type === "airport" && b.type === "oil_facility") ||
          (a.type === "port" && b.type === "oil_facility") ||
          (a.type === "exchange" && (b.type === "oil_facility" || b.type === "port"));

        if (sameCountry || crossType) {
          edges.push({
            from: a,
            to: b,
            weight: (a.severity + b.severity) / 2,
            cascadeRisk: Math.min(a.severity * b.severity * 1.5, 1),
          });
        }
      }
    }

    return edges;
  }, [geoNodes]);
}

export function StrategicMeshLayer() {
  const mesh = useStrategicMeshLayer();
  // Mesh rendering is handled by CenterGlobeStage's SVG/deck.gl renderer.
  // This hook exposes the computed mesh edges for consumption by any renderer.
  return null;
}
