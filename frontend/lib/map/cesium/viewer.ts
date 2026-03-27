/* ── CesiumJS Viewer Configuration ──
   Production viewer setup for the GCC Command Center.
   Dark imagery, no clutter UI, smooth camera transitions. */

import {
  Viewer,
  Ion,
  Cartesian3,
  Math as CesiumMath,
  Color,
  SceneMode,
  ImageryLayer,
  UrlTemplateImageryProvider,
  EllipsoidTerrainProvider,
  Camera,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
  defined,
} from "cesium";

/* ── Cesium CDN Base URL ── */
const CESIUM_CDN_VERSION = "1.121";
const CESIUM_CDN_BASE = `https://cesium.com/downloads/cesiumjs/releases/${CESIUM_CDN_VERSION}/Build/Cesium`;

/* ── GCC Camera Targets ── */
export const GCC_CENTER = { lat: 25.5, lng: 51.0, alt: 2_500_000 };
export const HORMUZ_VIEW = { lat: 26.5, lng: 56.25, alt: 500_000 };
export const UAE_VIEW = { lat: 25.0, lng: 55.3, alt: 300_000 };
export const KSA_VIEW = { lat: 24.7, lng: 46.7, alt: 1_500_000 };

/* ── Viewer Options ── */
export interface ViewerOptions {
  container: HTMLElement;
  ionToken?: string;
}

/* ── Initialize Cesium Viewer ── */
export function initViewer({ container, ionToken }: ViewerOptions): Viewer {
  if (ionToken) {
    Ion.defaultAccessToken = ionToken;
  }

  // Set CESIUM_BASE_URL for workers/assets (CDN)
  if (typeof window !== "undefined") {
    (window as unknown as Record<string, unknown>).CESIUM_BASE_URL = CESIUM_CDN_BASE;
  }

  const viewer = new Viewer(container, {
    /* Disable all default UI chrome */
    animation: false,
    baseLayerPicker: false,
    fullscreenButton: false,
    geocoder: false,
    homeButton: false,
    infoBox: false,
    sceneModePicker: false,
    selectionIndicator: false,
    timeline: false,
    navigationHelpButton: false,
    creditContainer: document.createElement("div"), // Hide credits

    /* Scene config */
    sceneMode: SceneMode.SCENE3D,
    terrainProvider: new EllipsoidTerrainProvider(),
    requestRenderMode: true,
    maximumRenderTimeChange: Infinity,
    msaaSamples: 4,
  });

  /* ── Dark globe styling ── */
  const scene = viewer.scene;
  scene.backgroundColor = Color.fromCssColorString("#060810");
  scene.globe.baseColor = Color.fromCssColorString("#0a1020");
  scene.globe.showGroundAtmosphere = true;
  scene.globe.enableLighting = true;
  scene.fog.enabled = false;
  if (scene.skyBox) scene.skyBox.show = false;
  if (scene.sun) scene.sun.show = false;
  if (scene.moon) scene.moon.show = false;

  /* Atmosphere */
  if (scene.skyAtmosphere) {
    scene.skyAtmosphere.show = true;
    scene.skyAtmosphere.brightnessShift = -0.4;
    scene.skyAtmosphere.saturationShift = -0.3;
  }

  /* ── Initial camera → GCC overview ── */
  flyTo(viewer, GCC_CENTER.lat, GCC_CENTER.lng, GCC_CENTER.alt, 0);

  return viewer;
}

/* ── Camera Controls ── */

export function flyTo(
  viewer: Viewer,
  lat: number,
  lng: number,
  alt: number,
  duration = 1.5
): void {
  viewer.camera.flyTo({
    destination: Cartesian3.fromDegrees(lng, lat, alt),
    orientation: {
      heading: CesiumMath.toRadians(0),
      pitch: CesiumMath.toRadians(-35),
      roll: 0,
    },
    duration,
  });
}

export function focusNode(
  viewer: Viewer,
  lat: number,
  lng: number,
  alt = 200_000
): void {
  viewer.camera.flyTo({
    destination: Cartesian3.fromDegrees(lng, lat, alt),
    orientation: {
      heading: CesiumMath.toRadians(0),
      pitch: CesiumMath.toRadians(-45),
      roll: 0,
    },
    duration: 1.0,
  });
}

export function resetView(viewer: Viewer): void {
  flyTo(viewer, GCC_CENTER.lat, GCC_CENTER.lng, GCC_CENTER.alt, 1.5);
}

/* ── Cleanup ── */
export function destroyViewer(viewer: Viewer): void {
  if (!viewer.isDestroyed()) {
    viewer.destroy();
  }
}
