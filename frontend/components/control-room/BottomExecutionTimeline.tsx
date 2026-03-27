"use client";

import { useMemo } from "react";
import { useControlRoomStore } from "@/lib/state/controlRoomStore";
import { crCopy } from "@/lib/config/control-room-copy";
import { t } from "@/lib/utils/i18n";
import type { TimelineTask, TimelineTaskStatus } from "@/lib/types/controlRoom";

const STATUS_COLOR: Record<TimelineTaskStatus, string> = {
  pending: "bg-white/10 border-white/10 text-white/50",
  in_progress: "bg-blue-500/20 border-blue-500/30 text-blue-300",
  completed: "bg-emerald-500/15 border-emerald-500/25 text-emerald-300",
  overdue: "bg-red-500/15 border-red-500/25 text-red-300",
  blocked: "bg-amber-500/15 border-amber-500/25 text-amber-300",
};

export function BottomExecutionTimeline() {
  const { state, dispatch } = useControlRoomStore();
  const { tasks, timeline, lang } = state;

  const lanes = useMemo(() => {
    const laneMap = new Map<string, TimelineTask[]>();
    for (const task of tasks) {
      const existing = laneMap.get(task.lane) ?? [];
      existing.push(task);
      laneMap.set(task.lane, existing);
    }
    return Array.from(laneMap.entries());
  }, [tasks]);

  const hourMarkers = useMemo(() => {
    const markers: number[] = [];
    const step = timeline.horizonHours <= 24 ? 2 : timeline.horizonHours <= 48 ? 4 : 6;
    for (let h = 0; h <= timeline.horizonHours; h += step) {
      markers.push(h);
    }
    return markers;
  }, [timeline.horizonHours]);

  return (
    <div
      className="flex flex-col border-t border-white/[0.06] bg-[#080c18]/80"
      style={{ gridArea: "timeline" }}
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between border-b border-white/[0.04] px-4 py-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/30">
          {t(crCopy.timeline.title, lang)}
        </span>
        <span className="text-[9px] text-white/25">
          T₀ + {timeline.currentHour}h / {timeline.horizonHours}h
        </span>
      </div>

      {tasks.length === 0 ? (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-[11px] text-white/25">
            {t(crCopy.timeline.noTasks, lang)}
          </p>
        </div>
      ) : (
        <div className="flex flex-1 overflow-x-auto">
          {/* ── Lane Labels ── */}
          <div className="flex shrink-0 flex-col border-r border-white/[0.04]" style={{ width: 100 }}>
            {/* Hour ruler header spacer */}
            <div className="h-5 border-b border-white/[0.04]" />
            {lanes.map(([laneName]) => (
              <div
                key={laneName}
                className="flex items-center border-b border-white/[0.04] px-2"
                style={{ height: 36 }}
              >
                <span className="text-[9px] text-white/35 truncate">{laneName}</span>
              </div>
            ))}
          </div>

          {/* ── Timeline Area ── */}
          <div className="flex-1 relative" style={{ minWidth: Math.max(600, timeline.horizonHours * 12) }}>
            {/* Hour Ruler */}
            <div className="flex h-5 border-b border-white/[0.04]">
              {hourMarkers.map((h) => (
                <div
                  key={h}
                  className="absolute top-0 flex h-5 items-end"
                  style={{ left: `${(h / timeline.horizonHours) * 100}%` }}
                >
                  <span className="text-[8px] text-white/20 -translate-x-1/2">
                    {h}h
                  </span>
                </div>
              ))}
            </div>

            {/* Playhead */}
            <div
              className="absolute top-0 bottom-0 w-px bg-blue-500/50 z-10"
              style={{ left: `${(timeline.currentHour / timeline.horizonHours) * 100}%` }}
            >
              <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 h-2 w-2 rounded-full bg-blue-500" />
            </div>

            {/* Grid Columns */}
            {hourMarkers.map((h) => (
              <div
                key={`grid-${h}`}
                className="absolute top-5 bottom-0 w-px bg-white/[0.02]"
                style={{ left: `${(h / timeline.horizonHours) * 100}%` }}
              />
            ))}

            {/* Task Bars */}
            {lanes.map(([laneName, laneTasks], laneIdx) => (
              <div
                key={laneName}
                className="relative border-b border-white/[0.04]"
                style={{ height: 36, top: 0 }}
              >
                {laneTasks.map((task) => {
                  const left = (task.startHour / timeline.horizonHours) * 100;
                  const width = (task.durationHours / timeline.horizonHours) * 100;
                  const statusClass = STATUS_COLOR[task.status] ?? STATUS_COLOR.pending;

                  return (
                    <div
                      key={task.id}
                      className={`absolute top-1 bottom-1 rounded-md border px-2 flex items-center overflow-hidden ${statusClass}`}
                      style={{ left: `${left}%`, width: `${Math.max(width, 2)}%` }}
                      title={task.label}
                    >
                      <span className="text-[9px] font-medium truncate">
                        {task.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
