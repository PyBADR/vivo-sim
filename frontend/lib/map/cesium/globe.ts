/* ── CesiumJS Globe Engine ──
   Configures the Cesium Viewer for the GCC operational theater.
   Entry point for CesiumJS integration — called when resium is available.

   Architecture Decision:
   - Use Ion default imagery for base layer
   - Disable default UI (we render our own)
   - GCC center: lat 25.5, lng 51.0
   - Initial camera: pitched -35° for 3D perspective
   - All entity rendering via deck.gl overlay (not Cesium entities) for 60fps

   This module exports config objects, not React components.
   React integration is in CenterGlobeStage.tsx via resium. */

import type { GeoCoord } from "@/lib/types/controlRoom";

/* ── Cesium Viewer Options ── */

export interface GlobeViewerConfig {
  terrainProvider: "ellipsoid" | "cesium-world";
  imageryProvider: "ion-default" | "mapbox-dark" | "none";
  enableLighting: boolean;
  showAtmosphere: boolean;
  showGroundAtmosphere: boolean;
  baseColor: string;
  skyBox: boolean;
  skyAtmosphere: boolean;
  enableFog: boolean;
  requestRenderMode: boolean;
  maximumRenderTimeChange: number;
}

export const defaultGlobeConfig: GlobeViewerConfig = {
  terrainProvider: "ellipsoid",         // Flat for performance
  imageryProvider: "ion-default",
  enableLighting: true,
  showAtmosphere: true,
  showGroundAtmosphere: true,
  baseColor: "#060810",
  skyBox: false,                        // We render our own dark bg
  skyAtmosphere: true,
  enableFog: false,
  requestRenderMode: true,              // Only render on change → 60fps
  maximumRenderTimeChange: Infinity,
};

/* ── Camera Presets ── */

export interface CameraPreset {
  name: string;
  destination: GeoCoord & { alt: number };
  orientation: {
    heading: number;    // degrees
    pitch: number;      // degrees (negative = looking down)
    roll: number;
  };
}

export const GCC_CAMERA_PRESETS: CameraPreset[] = [
  {
    name: "GCC Overview",
    destination: { lat: 25.5, lng: 51.0, alt: 2500000 },
    orientation: { heading: 0, pitch: -35, roll: 0 },
  },
  {
    name: "Strait of Hormuz",
    destination: { lat: 26.5, lng: 56.25, alt: 500000 },
    orientation: { heading: -15, pitch: -30, roll: 0 },
  },
  {
    name: "UAE Corridor",
    destination: { lat: 25.0, lng: 55.3, alt: 300000 },
    orientation: { heading: 0, pitch: -40, roll: 0 },
  },
  {
    name: "Saudi Arabia",
    destination: { lat: 24.7, lng: 46.7, alt: 1500000 },
    orientation: { heading: 10, pitch: -30, roll: 0 },
  },
];

/* ── Utility: Convert GeoCoord to Cesium Cartesian3 args ── */

export function geoToCartesian(coord: GeoCoord): {
  longitude: number;
  latitude: number;
  height: number;
} {
  return {
    longitude: coord.lng,
    latitude: coord.lat,
    height: coord.alt ?? 0,
  };
}

/* ── Globe Style Constants ── */

export const GLOBE_STYLE = {
  nodeDefaultColor: [96, 165, 250, 200] as [number, number, number, number],    // blue-400
  nodeCriticalColor: [248, 113, 113, 220] as [number, number, number, number],  // red-400
  nodeHighColor: [251, 146, 60, 200] as [number, number, number, number],       // orange-400
  nodeElevatedColor: [251, 191, 36, 200] as [number, number, number, number],   // amber-400
  nodeSelectedColor: [59, 130, 246, 255] as [number, number, number, number],   // blue-500

  routeNormalColor: [96, 165, 250, 60] as [number, number, number, number],
  routeDisruptedColor: [248, 113, 113, 120] as [number, number, number, number],

  heatmapColors: [
    [52, 211, 153, 40],   // emerald — low
    [96, 165, 250, 80],   // blue — guarded
    [251, 191, 36, 120],  // amber — elevated
    [251, 146, 60, 160],  // orange — high
    [248, 113, 113, 200], // red — critical
  ] as [number, number, number, number][],
} as const;
