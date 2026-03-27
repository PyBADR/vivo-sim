"use client";

import { useControlRoomStore } from "@/lib/state/controlRoomStore";
import { crCopy } from "@/lib/config/control-room-copy";
import { t } from "@/lib/utils/i18n";
import { threatColor, threatBg, severityColor } from "@/lib/theme/command-center-theme";
import type { ThreatLevel } from "@/lib/types/controlRoom";

export function LeftSituationRail() {
  const { state, dispatch } = useControlRoomStore();
  const { incident, layers, geoNodes, selectedNodeId, lang, playback, narrativeEvents } = state;
  const isPlaybackActive = playback.status !== "idle";

  return (
    <aside
      className="flex flex-col gap-3 overflow-y-auto border-r border-white/[0.06] bg-[#080c18]/60 p-3"
      style={{ gridArea: "left" }}
    >
      {/* ── Section: Situation Awareness ── */}
      <div className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/30">
        {t(crCopy.situation.title, lang)}
      </div>

      {/* ── Incident Brief ── */}
      {incident ? (
        <div className="space-y-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider text-white/40">
              {t(crCopy.situation.incidentBrief, lang)}
            </span>
            <span
              className={`rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase ${threatColor(incident.threatLevel)} ${threatBg(incident.threatLevel)}`}
            >
              {t(crCopy.threats[incident.threatLevel] ?? crCopy.threats.low, lang)}
            </span>
          </div>

          <p className="text-[13px] font-medium text-white/90 leading-snug">
            {incident.title}
          </p>

          <p className="text-[11px] text-white/50 leading-relaxed line-clamp-4">
            {incident.summary}
          </p>

          {/* Affected Countries */}
          <div>
            <span className="text-[9px] uppercase tracking-wider text-white/30">
              {t(crCopy.situation.affectedCountries, lang)}
            </span>
            <div className="mt-1 flex flex-wrap gap-1">
              {incident.affectedCountries.map((c) => (
                <span
                  key={c}
                  className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[9px] text-white/60"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>

          {/* Key Metrics */}
          <div>
            <span className="text-[9px] uppercase tracking-wider text-white/30">
              {t(crCopy.situation.keyMetrics, lang)}
            </span>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {incident.keyMetrics.map((m) => (
                <div
                  key={m.label}
                  className="rounded-lg bg-black/30 p-2 space-y-0.5"
                >
                  <p className="text-[9px] text-white/35 truncate">{m.label}</p>
                  <p
                    className={`text-sm font-semibold ${m.severity ? threatColor(m.severity) : "text-white"}`}
                  >
                    {m.value}
                    {m.unit && (
                      <span className="text-[9px] text-white/30 ml-0.5">
                        {m.unit}
                      </span>
                    )}
                  </p>
                  {m.trend && (
                    <span className="text-[9px] text-white/30">
                      {m.trend === "up" ? "↑" : m.trend === "down" ? "↓" : "→"}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
          <p className="text-[11px] text-white/30 text-center">
            {t(crCopy.situation.noIncident, lang)}
          </p>
        </div>
      )}

      {/* ── Geospatial Layers ── */}
      <div className="space-y-2">
        <span className="text-[10px] uppercase tracking-[0.25em] text-white/30">
          {t(crCopy.situation.layers, lang)}
        </span>
        {layers.map((layer) => (
          <button
            key={layer.id}
            onClick={() => dispatch({ type: "TOGGLE_LAYER", layerId: layer.id })}
            className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-[11px] transition-colors ${
              layer.visibility === "visible"
                ? "bg-blue-500/10 border border-blue-500/20 text-blue-300"
                : "bg-white/[0.02] border border-white/[0.04] text-white/40 hover:bg-white/[0.04]"
            }`}
          >
            <span>{layer.label}</span>
            <span className="text-[9px] opacity-60">{layer.nodeCount}</span>
          </button>
        ))}
      </div>

      {/* ── Narrative Event Feed (during playback) ── */}
      {isPlaybackActive && narrativeEvents.length > 0 && (
        <div className="space-y-2">
          <span className="text-[10px] uppercase tracking-[0.25em] text-white/30">
            {lang === "ar" ? "مراحل التأثير" : "Impact Stages"}
          </span>

          {/* Stage Progress Bar */}
          <div className="flex items-center gap-0.5 px-1">
            {narrativeEvents.map((ev, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                  ev.active
                    ? ev.severity === "critical"
                      ? "bg-red-400/70"
                      : ev.severity === "warning"
                      ? "bg-amber-400/60"
                      : "bg-blue-400/50"
                    : "bg-white/[0.06]"
                }`}
              />
            ))}
          </div>

          {/* Event Cards */}
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {narrativeEvents.map((ev, i) => {
              // Current stage = last active event
              const isCurrentStage = ev.active && (i === narrativeEvents.length - 1 || !narrativeEvents[i + 1]?.active);

              return (
                <div
                  key={i}
                  className={`rounded-lg border p-2 transition-all ${
                    isCurrentStage
                      ? ev.severity === "critical"
                        ? "border-red-500/30 bg-red-500/[0.08] shadow-[0_0_8px_rgba(239,68,68,0.1)]"
                        : ev.severity === "warning"
                        ? "border-amber-500/30 bg-amber-500/[0.08] shadow-[0_0_8px_rgba(245,158,11,0.1)]"
                        : "border-blue-500/30 bg-blue-500/[0.08] shadow-[0_0_8px_rgba(96,165,250,0.1)]"
                      : ev.active
                      ? ev.severity === "critical"
                        ? "border-red-500/20 bg-red-500/[0.04]"
                        : ev.severity === "warning"
                        ? "border-amber-500/20 bg-amber-500/[0.04]"
                        : "border-blue-500/20 bg-blue-500/[0.04]"
                      : "border-white/[0.04] bg-white/[0.01] opacity-35"
                  }`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <div className="flex items-center gap-1.5">
                      {/* Stage number */}
                      <span className={`text-[7px] font-mono rounded-full w-3.5 h-3.5 flex items-center justify-center ${
                        ev.active ? "bg-white/10 text-white/50" : "bg-white/[0.03] text-white/15"
                      }`}>
                        {i + 1}
                      </span>
                      <span className={`text-[8px] font-mono ${
                        ev.active ? "text-white/50" : "text-white/20"
                      }`}>
                        T+{ev.hour}h
                      </span>
                    </div>
                    <span className={`text-[7px] uppercase tracking-wider ${
                      ev.severity === "critical"
                        ? "text-red-400"
                        : ev.severity === "warning"
                        ? "text-amber-400"
                        : "text-blue-400"
                    }`}>
                      {ev.severity}
                    </span>
                  </div>
                  <p className={`text-[10px] font-medium leading-snug ${
                    ev.active ? "text-white/80" : "text-white/30"
                  }`}>
                    {ev.title}
                  </p>
                  {ev.active && (
                    <p className="mt-1 text-[9px] text-white/40 leading-relaxed line-clamp-2">
                      {ev.description}
                    </p>
                  )}
                  {/* Related nodes */}
                  {isCurrentStage && ev.relatedNodes.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-0.5">
                      {ev.relatedNodes.map((nid) => (
                        <span
                          key={nid}
                          className="rounded bg-white/[0.06] px-1 py-px text-[7px] text-white/40 font-mono"
                        >
                          {nid}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Selected Node Detail ── */}
      {selectedNodeId && (
        <SelectedNodeDetail
          nodeId={selectedNodeId}
          nodes={geoNodes}
          lang={lang}
          onClose={() => dispatch({ type: "SELECT_NODE", nodeId: null })}
        />
      )}
    </aside>
  );
}

/* ── Inline: Selected Node Detail Card ── */

function SelectedNodeDetail({
  nodeId,
  nodes,
  lang,
  onClose,
}: {
  nodeId: string;
  nodes: import("@/lib/types/controlRoom").GeoNode[];
  lang: "en" | "ar";
  onClose: () => void;
}) {
  const node = nodes.find((n) => n.id === nodeId);
  if (!node) return null;

  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-wider text-white/40">
          {t(
            crCopy.nodeTypes[node.type as keyof typeof crCopy.nodeTypes] ??
              crCopy.nodeTypes.city,
            lang
          )}
        </span>
        <button
          onClick={onClose}
          className="text-[10px] text-white/30 hover:text-white/60"
        >
          ✕
        </button>
      </div>
      <p className="text-[13px] font-medium text-white/90">{node.label}</p>
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-white/35">Severity</span>
        <div className="h-1.5 flex-1 rounded-full bg-white/[0.06]">
          <div
            className={`h-1.5 rounded-full transition-all ${
              node.severity >= 0.7
                ? "bg-red-400"
                : node.severity >= 0.4
                ? "bg-amber-400"
                : "bg-emerald-400"
            }`}
            style={{ width: `${Math.min(node.severity * 100, 100)}%` }}
          />
        </div>
        <span className={`text-[11px] font-medium ${severityColor(node.severity)}`}>
          {Math.round(node.severity * 100)}%
        </span>
      </div>
      <div className="flex items-center gap-2 text-[10px] text-white/35">
        <span>{node.country}</span>
        <span>·</span>
        <span>
          {node.coord.lat.toFixed(2)}, {node.coord.lng.toFixed(2)}
        </span>
      </div>
    </div>
  );
}
