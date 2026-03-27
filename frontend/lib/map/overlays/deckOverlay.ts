/* ── deck.gl Overlay Configuration ──
   Defines deck.gl layer factories for rendering GeoNodes, GeoRoutes,
   and ImpactHeatCells on top of the CesiumJS globe.

   Architecture Decision:
   - deck.gl provides GPU-accelerated 2D/3D overlays
   - Each layer type maps to a specific deck.gl layer class
   - Colors derived from severity using GLOBE_STYLE constants
   - When CesiumJS is unavailable, these configs drive the SVG fallback

   This module exports pure functions that return layer config objects.
   The actual deck.gl instantiation happens in CenterGlobeStage. */

import { GLOBE_STYLE } from "@/lib/map/cesium/globe";
import type { GeoNode, GeoRoute, ImpactHeatCell } from "@/lib/types/controlRoom";

/* ── Layer Config Types ── */

export interface ScatterLayerConfig {
  id: string;
  data: GeoNode[];
  getPosition: (d: GeoNode) => [number, number];
  getRadius: (d: GeoNode) => number;
  getFillColor: (d: GeoNode) => [number, number, number, number];
  pickable: boolean;
  radiusMinPixels: number;
  radiusMaxPixels: number;
}

export interface ArcLayerConfig {
  id: string;
  data: GeoRoute[];
  getSourcePosition: (d: GeoRoute) => [number, number];
  getTargetPosition: (d: GeoRoute) => [number, number];
  getSourceColor: (d: GeoRoute) => [number, number, number, number];
  getTargetColor: (d: GeoRoute) => [number, number, number, number];
  getWidth: (d: GeoRoute) => number;
  pickable: boolean;
}

export interface HeatmapLayerConfig {
  id: string;
  data: ImpactHeatCell[];
  getPosition: (d: ImpactHeatCell) => [number, number];
  getWeight: (d: ImpactHeatCell) => number;
  radiusPixels: number;
  intensity: number;
  threshold: number;
}

/* ── Layer Factories ── */

export function buildGeoNodesLayer(
  nodes: GeoNode[],
  selectedNodeId: string | null
): ScatterLayerConfig {
  return {
    id: "geo-nodes-layer",
    data: nodes,
    getPosition: (d) => [d.coord.lng, d.coord.lat],
    getRadius: (d) =>
      d.id === selectedNodeId
        ? 12000
        : d.severity >= 0.7
        ? 8000
        : d.severity >= 0.4
        ? 6000
        : 4000,
    getFillColor: (d) => {
      if (d.id === selectedNodeId) return GLOBE_STYLE.nodeSelectedColor;
      if (d.severity >= 0.7) return GLOBE_STYLE.nodeCriticalColor;
      if (d.severity >= 0.5) return GLOBE_STYLE.nodeHighColor;
      if (d.severity >= 0.3) return GLOBE_STYLE.nodeElevatedColor;
      return GLOBE_STYLE.nodeDefaultColor;
    },
    pickable: true,
    radiusMinPixels: 3,
    radiusMaxPixels: 15,
  };
}

export function buildArcRoutesLayer(routes: GeoRoute[]): ArcLayerConfig {
  return {
    id: "arc-routes-layer",
    data: routes,
    getSourcePosition: (d) => [d.from.lng, d.from.lat],
    getTargetPosition: (d) => [d.to.lng, d.to.lat],
    getSourceColor: (d) =>
      d.disrupted
        ? GLOBE_STYLE.routeDisruptedColor
        : GLOBE_STYLE.routeNormalColor,
    getTargetColor: (d) =>
      d.disrupted
        ? GLOBE_STYLE.routeDisruptedColor
        : GLOBE_STYLE.routeNormalColor,
    getWidth: (d) => (d.disrupted ? 2 : 1),
    pickable: true,
  };
}

export function buildImpactHeatmapLayer(
  cells: ImpactHeatCell[]
): HeatmapLayerConfig {
  return {
    id: "impact-heatmap-layer",
    data: cells,
    getPosition: (d) => [d.coord.lng, d.coord.lat],
    getWeight: (d) => d.intensity,
    radiusPixels: 60,
    intensity: 1.5,
    threshold: 0.1,
  };
}

/* ── Utility: Severity → RGBA ── */

export function severityToRGBA(severity: number): [number, number, number, number] {
  if (severity >= 0.8) return GLOBE_STYLE.nodeCriticalColor;
  if (severity >= 0.6) return GLOBE_STYLE.nodeHighColor;
  if (severity >= 0.4) return GLOBE_STYLE.nodeElevatedColor;
  if (severity >= 0.2) return GLOBE_STYLE.nodeDefaultColor;
  return [255, 255, 255, 60];
}
