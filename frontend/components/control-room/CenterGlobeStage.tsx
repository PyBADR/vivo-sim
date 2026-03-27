"use client";

import { useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { useControlRoomStore } from "@/lib/state/controlRoomStore";
import { crCopy } from "@/lib/config/control-room-copy";
import { t } from "@/lib/utils/i18n";
import { severityColor, severityBarColor } from "@/lib/theme/command-center-theme";
import type { GeoNode, GeoRoute } from "@/lib/types/controlRoom";

/* ── CesiumJS is loaded dynamically (SSR=false) ── */
/* The actual Cesium globe will be injected when resium is installed.
   Until then, we render a high-fidelity SVG/Canvas fallback that
   shows the same data as the globe would — nodes, routes, severity. */

export function CenterGlobeStage() {
  const { state, dispatch } = useControlRoomStore();
  const { geoNodes, geoRoutes, layers, selectedNodeId, lang, assessment } = state;

  const visibleNodes = useMemo(() => {
    const visibleLayerTypes: string[] = [];
    for (const l of layers) {
      if (l.visibility !== "visible") continue;
      if (l.id === "airports") visibleLayerTypes.push("airport");
      if (l.id === "ports") visibleLayerTypes.push("port", "oil_facility", "chokepoint");
      if (l.id === "exchanges") visibleLayerTypes.push("exchange");
    }
    return geoNodes.filter((n) => visibleLayerTypes.includes(n.type));
  }, [geoNodes, layers]);

  const visibleRoutes = useMemo(() => {
    const routeLayer = layers.find((l) => l.id === "routes");
    return routeLayer?.visibility === "visible" ? geoRoutes : [];
  }, [geoRoutes, layers]);

  const handleNodeClick = useCallback(
    (nodeId: string) => {
      dispatch({ type: "SELECT_NODE", nodeId: selectedNodeId === nodeId ? null : nodeId });
    },
    [dispatch, selectedNodeId]
  );

  return (
    <div
      className="relative flex flex-col overflow-hidden bg-[#050810]"
      style={{ gridArea: "globe" }}
    >
      {/* ── Globe / Map Canvas ── */}
      <div className="relative flex-1">
        {/* SVG-based GCC Operational Theater (production fallback) */}
        <GCCTheaterMap
          nodes={visibleNodes}
          routes={visibleRoutes}
          selectedNodeId={selectedNodeId}
          onNodeClick={handleNodeClick}
        />

        {/* Globe Controls Overlay */}
        <div className="absolute bottom-3 right-3 flex flex-col gap-1">
          <button className="rounded-md border border-white/[0.08] bg-black/50 p-1.5 text-[10px] text-white/40 backdrop-blur hover:bg-white/[0.06]">
            +
          </button>
          <button className="rounded-md border border-white/[0.08] bg-black/50 p-1.5 text-[10px] text-white/40 backdrop-blur hover:bg-white/[0.06]">
            −
          </button>
          <button className="rounded-md border border-white/[0.08] bg-black/50 p-1.5 text-[10px] text-white/40 backdrop-blur hover:bg-white/[0.06]">
            ⟲
          </button>
        </div>

        {/* Title Overlay */}
        <div className="absolute left-3 top-3">
          <span className="rounded-md bg-black/60 px-2 py-1 text-[9px] uppercase tracking-[0.25em] text-white/40 backdrop-blur">
            {t(crCopy.globe.title, lang)}
          </span>
        </div>

        {/* Node Count Overlay */}
        <div className="absolute right-3 top-3">
          <span className="rounded-md bg-black/60 px-2 py-1 text-[9px] text-white/30 backdrop-blur">
            {visibleNodes.length} nodes · {visibleRoutes.length} routes
          </span>
        </div>
      </div>

      {/* ── No Data State ── */}
      {!assessment && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#050810]/80">
          <p className="text-[11px] text-white/30">
            {t(crCopy.globe.noData, lang)}
          </p>
        </div>
      )}
    </div>
  );
}

/* ── GCC Theater SVG Map ──
   High-fidelity 2D representation of the GCC region.
   Maps lat/lng to SVG coordinates within the Arabian Gulf viewport. */

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
  // Viewport: lat 20-32, lng 36-60 → SVG 0-800 x 0-500
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
      {/* Grid lines */}
      {Array.from({ length: 7 }).map((_, i) => {
        const x = (i / 6) * 800;
        return (
          <line
            key={`vg-${i}`}
            x1={x} y1={0} x2={x} y2={500}
            stroke="rgba(255,255,255,0.03)" strokeWidth={0.5}
          />
        );
      })}
      {Array.from({ length: 5 }).map((_, i) => {
        const y = (i / 4) * 500;
        return (
          <line
            key={`hg-${i}`}
            x1={0} y1={y} x2={800} y2={y}
            stroke="rgba(255,255,255,0.03)" strokeWidth={0.5}
          />
        );
      })}

      {/* Routes */}
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

      {/* Nodes */}
      {nodes.map((node) => {
        const [cx, cy] = project(node.coord.lat, node.coord.lng);
        const isSelected = node.id === selectedNodeId;
        const radius = isSelected ? 7 : node.severity > 0.5 ? 5 : 3.5;
        const color =
          node.severity >= 0.7
            ? "#f87171"
            : node.severity >= 0.4
            ? "#fbbf24"
            : node.severity > 0
            ? "#60a5fa"
            : "rgba(255,255,255,0.3)";

        return (
          <g
            key={node.id}
            onClick={() => onNodeClick(node.id)}
            style={{ cursor: "pointer" }}
          >
            {/* Pulse ring for high severity */}
            {node.severity >= 0.6 && (
              <circle
                cx={cx} cy={cy} r={radius + 4}
                fill="none"
                stroke={color}
                strokeWidth={0.5}
                opacity={0.4}
              >
                <animate
                  attributeName="r"
                  from={String(radius + 2)}
                  to={String(radius + 10)}
                  dur="2s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  from="0.4"
                  to="0"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </circle>
            )}

            {/* Selection ring */}
            {isSelected && (
              <circle
                cx={cx} cy={cy} r={radius + 3}
                fill="none"
                stroke="#3b82f6"
                strokeWidth={1.5}
              />
            )}

            {/* Node dot */}
            <circle cx={cx} cy={cy} r={radius} fill={color} opacity={0.9} />

            {/* Label */}
            <text
              x={cx}
              y={cy - radius - 4}
              textAnchor="middle"
              fill="rgba(255,255,255,0.5)"
              fontSize={8}
              fontFamily="system-ui"
            >
              {node.id}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
