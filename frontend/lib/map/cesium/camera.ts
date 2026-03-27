/* ── Camera Choreography ──
   Guided camera transitions for demo mode.
   Smooth motion, comprehension over spectacle.
   Each camera move clarifies the operational story. */

import type { DemoStage } from "@/lib/demo/demoMode";

/* ── Camera Target ── */

export interface CameraTarget {
  lat: number;
  lng: number;
  zoom: number;
  duration: number; // seconds
}

/* ── Stage-to-Camera Mapping ── */

export function getCameraTargetForStage(stage: DemoStage): CameraTarget {
  return {
    lat: stage.mapFocusTarget.lat,
    lng: stage.mapFocusTarget.lng,
    zoom: stage.mapFocusTarget.zoom,
    duration: 2.0,
  };
}

/* ── SVG Map Focus (project-space pan/zoom) ── */

export interface SVGViewBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Map focus target → SVG viewBox
// Our SVG projection: x = ((lng - 36) / 24) * 800, y = ((32 - lat) / 12) * 500
export function computeSVGViewBox(target: CameraTarget): SVGViewBox {
  const centerX = ((target.lng - 36) / 24) * 800;
  const centerY = ((32 - target.lat) / 12) * 500;

  // Zoom level maps inversely to viewBox size
  // zoom 5 = full view (800x500), zoom 8 = tight (300x187)
  const scale = Math.pow(2, -(target.zoom - 5) * 0.6);
  const width = 800 * scale;
  const height = 500 * scale;

  return {
    x: Math.max(0, centerX - width / 2),
    y: Math.max(0, centerY - height / 2),
    width: Math.min(800, width),
    height: Math.min(500, height),
  };
}

/* ── Default regional overview ── */

export const DEFAULT_VIEW_BOX: SVGViewBox = { x: 0, y: 0, width: 800, height: 500 };

/* ── Interpolate viewBox for smooth transitions ── */

export function interpolateViewBox(
  from: SVGViewBox,
  to: SVGViewBox,
  t: number // 0-1 eased progress
): SVGViewBox {
  const ease = easeInOutCubic(t);
  return {
    x: from.x + (to.x - from.x) * ease,
    y: from.y + (to.y - from.y) * ease,
    width: from.width + (to.width - from.width) * ease,
    height: from.height + (to.height - from.height) * ease,
  };
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
