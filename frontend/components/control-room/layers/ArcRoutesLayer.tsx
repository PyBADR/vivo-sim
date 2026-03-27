"use client";

/* ── Arc Routes Layer ──
   Renders air/sea/pipeline routes between GCC nodes.
   Disrupted routes shown in red with dashed pattern. */

import { useMemo } from "react";
import { useControlRoomStore } from "@/lib/state/controlRoomStore";
import { buildArcRoutesLayer } from "@/lib/map/overlays/deckOverlay";
import type { ArcLayerConfig } from "@/lib/map/overlays/deckOverlay";

export function useArcRoutesLayer(): ArcLayerConfig | null {
  const { state } = useControlRoomStore();
  const { geoRoutes, layers } = state;

  return useMemo(() => {
    const routeLayer = layers.find((l) => l.id === "routes");
    if (routeLayer?.visibility !== "visible" || geoRoutes.length === 0) return null;
    return buildArcRoutesLayer(geoRoutes);
  }, [geoRoutes, layers]);
}

export function ArcRoutesLayer() {
  const config = useArcRoutesLayer();
  return null;
}
