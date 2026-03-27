"use client";

/* ── GeoNodes Scatter Layer ──
   Renders airports, ports, oil facilities, exchanges on the globe/map.
   Uses deck.gl ScatterplotLayer config when available,
   otherwise data is consumed by the SVG fallback in CenterGlobeStage. */

import { useMemo } from "react";
import { useControlRoomStore } from "@/lib/state/controlRoomStore";
import { buildGeoNodesLayer } from "@/lib/map/overlays/deckOverlay";
import type { ScatterLayerConfig } from "@/lib/map/overlays/deckOverlay";

export function useGeoNodesLayer(): ScatterLayerConfig | null {
  const { state } = useControlRoomStore();
  const { geoNodes, layers, selectedNodeId } = state;

  return useMemo(() => {
    const visibleTypes: string[] = [];
    for (const l of layers) {
      if (l.visibility !== "visible") continue;
      if (l.id === "airports") visibleTypes.push("airport");
      if (l.id === "ports") visibleTypes.push("port", "oil_facility", "chokepoint");
      if (l.id === "exchanges") visibleTypes.push("exchange");
    }

    const filtered = geoNodes.filter((n) => visibleTypes.includes(n.type));
    if (filtered.length === 0) return null;

    return buildGeoNodesLayer(filtered, selectedNodeId);
  }, [geoNodes, layers, selectedNodeId]);
}

/* Presentational component for future deck.gl integration */
export function GeoNodesLayer() {
  const config = useGeoNodesLayer();
  // When deck.gl is integrated, this component will render a DeckGL layer.
  // Currently, data flows through the store → CenterGlobeStage SVG fallback.
  return null;
}
