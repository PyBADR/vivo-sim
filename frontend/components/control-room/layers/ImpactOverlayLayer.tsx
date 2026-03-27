"use client";

/* ── Impact Overlay (Heatmap) Layer ──
   Renders crisis severity as a heatmap overlay on the globe/map.
   Intensity derived from node severity and propagation energy. */

import { useMemo } from "react";
import { useControlRoomStore } from "@/lib/state/controlRoomStore";
import { buildImpactHeatmapLayer } from "@/lib/map/overlays/deckOverlay";
import type { HeatmapLayerConfig } from "@/lib/map/overlays/deckOverlay";

export function useImpactOverlayLayer(): HeatmapLayerConfig | null {
  const { state } = useControlRoomStore();
  const { heatmap, layers } = state;

  return useMemo(() => {
    const heatLayer = layers.find((l) => l.id === "heatmap");
    if (heatLayer?.visibility !== "visible" || heatmap.length === 0) return null;
    return buildImpactHeatmapLayer(heatmap);
  }, [heatmap, layers]);
}

export function ImpactOverlayLayer() {
  const config = useImpactOverlayLayer();
  return null;
}
