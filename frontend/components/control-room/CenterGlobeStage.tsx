"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useControlRoomStore } from "@/lib/state/controlRoomStore";
import { crCopy } from "@/lib/config/control-room-copy";
import { t } from "@/lib/utils/i18n";
import type { GeoNode, GeoRoute } from "@/lib/types/controlRoom";

/* ── CesiumJS: dynamic import (SSR=false) ── */

let cesiumViewerModule: typeof import("@/lib/map/cesium/viewer") | null = null;
let CesiumLib: typeof import("cesium") | null = null;

export function CenterGlobeStage() {
  const { state, dispatch } = useControlRoomStore();
  const { geoNodes, geoRoutes, layers, selectedNodeId, lang, assessment } = state;
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<InstanceType<typeof import("cesium").Viewer> | null>(null);
  const entitiesRef = useRef<Map<string, unknown>>(new Map());
  const [cesiumReady, setCesiumReady] = useState(false);
  const [cesiumError, setCesiumError] = useState<string | null>(null);

  const visibleNodes = useMemo(() => {
    const visibleLayerTypes: string[] = [];
    for (const l of layers) {
      if (l.visibility !== "visible") continue;
      if (l.id === "airports") visibleLayerTypes.push("airport");
      if (l.id === "ports") visibleLayerTypes.push("port", "oil_facility", "chokepoint");
      if (l.id === "exchanges") visibleLayerTypes.push("exchange");
      if (l.id === "entities") visibleLayerTypes.push("city");
    }
    return geoNodes.filter((n) => visibleLayerTypes.includes(n.type));
  }, [geoNodes, layers]);

  const visibleRoutes = useMemo(() => {
    const routeLayer = layers.find((l) => l.id === "routes");
    return routeLayer?.visibility === "visible" ? geoRoutes : [];
  }, [geoRoutes, layers]);

  /* ── Initialize Cesium ── */
  useEffect(() => {
    if (!containerRef.current) return;
    let destroyed = false;

    (async () => {
      try {
        // Set base URL before any Cesium imports
        (window as unknown as Record<string, unknown>).CESIUM_BASE_URL =
          "https://cesium.com/downloads/cesiumjs/releases/1.121/Build/Cesium";

        const [viewerMod, cesium] = await Promise.all([
          import("@/lib/map/cesium/viewer"),
          import("cesium"),
        ]);

        if (destroyed) return;
        cesiumViewerModule = viewerMod;
        CesiumLib = cesium;

        // Cesium CSS loaded via CDN link in page head
        // @ts-ignore dynamic CSS import
        try { await import("cesium/Build/Cesium/Widgets/widgets.css"); } catch { /* CSS loaded via CDN fallback */ }

        const viewer = viewerMod.initViewer({
          container: containerRef.current!,
        });
        viewerRef.current = viewer;
        setCesiumReady(true);
      } catch (err) {
        if (!destroyed) {
          console.warn("Cesium init failed, using SVG fallback:", err);
          setCesiumError(
            err instanceof Error ? err.message : "Cesium failed to load"
          );
        }
      }
    })();

    return () => {
      destroyed = true;
      if (viewerRef.current && cesiumViewerModule) {
        cesiumViewerModule.destroyViewer(viewerRef.current);
        viewerRef.current = null;
      }
    };
  }, []); // Mount once, never remount

  /* ── Sync nodes to Cesium entities ── */
  useEffect(() => {
    if (!viewerRef.current || !CesiumLib || !cesiumReady) return;
    const viewer = viewerRef.current;
    const Cesium = CesiumLib;

    // Clear existing entities
    viewer.entities.removeAll();
    entitiesRef.current.clear();

    // Add nodes
    for (const node of visibleNodes) {
      const color =
        node.severity >= 0.7
          ? Cesium.Color.fromCssColorString("#f87171")
          : node.severity >= 0.4
          ? Cesium.Color.fromCssColorString("#fbbf24")
          : node.severity > 0
          ? Cesium.Color.fromCssColorString("#60a5fa")
          : Cesium.Color.fromCssColorString("rgba(255,255,255,0.4)");

      const radius = node.severity >= 0.7 ? 12000 : node.severity >= 0.4 ? 8000 : 5000;

      const entity = viewer.entities.add({
        id: node.id,
        position: Cesium.Cartesian3.fromDegrees(node.coord.lng, node.coord.lat),
        point: {
          pixelSize: radius / 1000,
          color,
          outlineColor:
            node.id === selectedNodeId
              ? Cesium.Color.fromCssColorString("#3b82f6")
              : Cesium.Color.TRANSPARENT,
          outlineWidth: node.id === selectedNodeId ? 3 : 0,
        },
        label: {
          text: node.id,
          font: "10px system-ui",
          fillColor: Cesium.Color.fromCssColorString("rgba(255,255,255,0.5)"),
          style: Cesium.LabelStyle.FILL,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          pixelOffset: new Cesium.Cartesian2(0, -10),
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },
      });
      entitiesRef.current.set(node.id, entity);
    }

    // Add routes as polylines
    for (const route of visibleRoutes) {
      const routeColor = route.disrupted
        ? Cesium.Color.fromCssColorString("rgba(248,113,113,0.5)")
        : Cesium.Color.fromCssColorString("rgba(96,165,250,0.25)");

      viewer.entities.add({
        id: route.id,
        polyline: {
          positions: Cesium.Cartesian3.fromDegreesArray([
            route.from.lng, route.from.lat,
            route.to.lng, route.to.lat,
          ]),
          width: route.disrupted ? 2 : 1,
          material: new Cesium.PolylineGlowMaterialProperty({
            glowPower: 0.2,
            color: routeColor,
          }),
          arcType: Cesium.ArcType.GEODESIC,
        },
      });
    }

    viewer.scene.requestRender();
  }, [visibleNodes, visibleRoutes, selectedNodeId, cesiumReady]);

  /* ── Click handler on Cesium ── */
  useEffect(() => {
    if (!viewerRef.current || !CesiumLib || !cesiumReady) return;
    const viewer = viewerRef.current;
    const Cesium = CesiumLib;

    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction((movement: { position: import("cesium").Cartesian2 }) => {
      const picked = viewer.scene.pick(movement.position);
      if (Cesium.defined(picked) && picked.id?.id) {
        const nodeId = picked.id.id as string;
        dispatch({
          type: "SELECT_NODE",
          nodeId: selectedNodeId === nodeId ? null : nodeId,
        });

        // Fly to selected node
        const node = geoNodes.find((n) => n.id === nodeId);
        if (node && cesiumViewerModule) {
          cesiumViewerModule.focusNode(viewer, node.coord.lat, node.coord.lng);
        }
      } else {
        dispatch({ type: "SELECT_NODE", nodeId: null });
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    return () => handler.destroy();
  }, [cesiumReady, selectedNodeId, geoNodes, dispatch]);

  const handleNodeClick = useCallback(
    (nodeId: string) => {
      dispatch({ type: "SELECT_NODE", nodeId: selectedNodeId === nodeId ? null : nodeId });
    },
    [dispatch, selectedNodeId]
  );

  const handleZoomIn = () => {
    if (viewerRef.current) {
      viewerRef.current.camera.zoomIn(viewerRef.current.camera.positionCartographic.height * 0.3);
    }
  };

  const handleZoomOut = () => {
    if (viewerRef.current) {
      viewerRef.current.camera.zoomOut(viewerRef.current.camera.positionCartographic.height * 0.3);
    }
  };

  const handleReset = () => {
    if (viewerRef.current && cesiumViewerModule) {
      cesiumViewerModule.resetView(viewerRef.current);
    }
  };

  return (
    <div
      className="relative flex flex-col overflow-hidden bg-[#050810]"
      style={{ gridArea: "globe" }}
    >
      {/* ── Cesium Container ── */}
      <div
        ref={containerRef}
        className="absolute inset-0"
        style={{ display: cesiumReady ? "block" : "none" }}
      />

      {/* ── SVG Fallback (shown while Cesium loads or if it fails) ── */}
      {!cesiumReady && (
        <div className="relative flex-1">
          <GCCTheaterMap
            nodes={visibleNodes}
            routes={visibleRoutes}
            selectedNodeId={selectedNodeId}
            onNodeClick={handleNodeClick}
          />
        </div>
      )}

      {/* Globe Controls Overlay */}
      <div className="absolute bottom-3 right-3 z-10 flex flex-col gap-1">
        <button
          onClick={handleZoomIn}
          className="rounded-md border border-white/[0.08] bg-black/50 p-1.5 text-[10px] text-white/40 backdrop-blur hover:bg-white/[0.06]"
        >
          +
        </button>
        <button
          onClick={handleZoomOut}
          className="rounded-md border border-white/[0.08] bg-black/50 p-1.5 text-[10px] text-white/40 backdrop-blur hover:bg-white/[0.06]"
        >
          −
        </button>
        <button
          onClick={handleReset}
          className="rounded-md border border-white/[0.08] bg-black/50 p-1.5 text-[10px] text-white/40 backdrop-blur hover:bg-white/[0.06]"
        >
          ⟲
        </button>
      </div>

      {/* Title Overlay */}
      <div className="absolute left-3 top-3 z-10">
        <span className="rounded-md bg-black/60 px-2 py-1 text-[9px] uppercase tracking-[0.25em] text-white/40 backdrop-blur">
          {t(crCopy.globe.title, lang)}
        </span>
      </div>

      {/* Node Count Overlay */}
      <div className="absolute right-3 top-3 z-10">
        <span className="rounded-md bg-black/60 px-2 py-1 text-[9px] text-white/30 backdrop-blur">
          {visibleNodes.length} nodes · {visibleRoutes.length} routes
          {cesiumReady && " · 3D"}
          {cesiumError && " · 2D"}
        </span>
      </div>

      {/* No Data State */}
      {!assessment && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#050810]/80">
          <p className="text-[11px] text-white/30">
            {t(crCopy.globe.noData, lang)}
          </p>
        </div>
      )}
    </div>
  );
}

/* ── GCC Theater SVG Map (Fallback) ── */

function GCCTheaterMap({
  nodes,
  routes,
  selectedNodeId,
  onNodeClick,
}: {
  nodes: GeoNode[];
  routes: GeoRoute[];
  selectedNodeId: string | null;
  onNodeClick: (id: string) => void;
}) {
  const project = (lat: number, lng: number): [number, number] => {
    const x = ((lng - 36) / 24) * 800;
    const y = ((32 - lat) / 12) * 500;
    return [x, y];
  };

  return (
    <svg
      viewBox="0 0 800 500"
      className="h-full w-full"
      style={{ background: "radial-gradient(ellipse at center, #0a1020 0%, #050810 100%)" }}
    >
      {Array.from({ length: 7 }).map((_, i) => {
        const x = (i / 6) * 800;
        return (
          <line key={`vg-${i}`} x1={x} y1={0} x2={x} y2={500} stroke="rgba(255,255,255,0.03)" strokeWidth={0.5} />
        );
      })}
      {Array.from({ length: 5 }).map((_, i) => {
        const y = (i / 4) * 500;
        return (
          <line key={`hg-${i}`} x1={0} y1={y} x2={800} y2={y} stroke="rgba(255,255,255,0.03)" strokeWidth={0.5} />
        );
      })}
      {routes.map((route) => {
        const [x1, y1] = project(route.from.lat, route.from.lng);
        const [x2, y2] = project(route.to.lat, route.to.lng);
        const midX = (x1 + x2) / 2;
        const midY = Math.min(y1, y2) - 30;
        return (
          <g key={route.id}>
            <path
              d={`M ${x1} ${y1} Q ${midX} ${midY} ${x2} ${y2}`}
              fill="none"
              stroke={route.disrupted ? "rgba(248,113,113,0.4)" : "rgba(96,165,250,0.2)"}
              strokeWidth={route.disrupted ? 1.5 : 0.8}
              strokeDasharray={route.disrupted ? "4 2" : "none"}
            />
          </g>
        );
      })}
      {nodes.map((node) => {
        const [cx, cy] = project(node.coord.lat, node.coord.lng);
        const isSelected = node.id === selectedNodeId;
        const radius = isSelected ? 7 : node.severity > 0.5 ? 5 : 3.5;
        const color = node.severity >= 0.7 ? "#f87171" : node.severity >= 0.4 ? "#fbbf24" : node.severity > 0 ? "#60a5fa" : "rgba(255,255,255,0.3)";
        return (
          <g key={node.id} onClick={() => onNodeClick(node.id)} style={{ cursor: "pointer" }}>
            {node.severity >= 0.6 && (
              <circle cx={cx} cy={cy} r={radius + 4} fill="none" stroke={color} strokeWidth={0.5} opacity={0.4}>
                <animate attributeName="r" from={String(radius + 2)} to={String(radius + 10)} dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" from="0.4" to="0" dur="2s" repeatCount="indefinite" />
              </circle>
            )}
            {isSelected && <circle cx={cx} cy={cy} r={radius + 3} fill="none" stroke="#3b82f6" strokeWidth={1.5} />}
            <circle cx={cx} cy={cy} r={radius} fill={color} opacity={0.9} />
            <text x={cx} y={cy - radius - 4} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize={8} fontFamily="system-ui">{node.id}</text>
          </g>
        );
      })}
    </svg>
  );
}
