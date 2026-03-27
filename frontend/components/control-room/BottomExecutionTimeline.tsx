"use client";

import { useCallback, useMemo, useReducer, useRef, useEffect } from "react";
import { useControlRoomStore } from "@/lib/state/controlRoomStore";
import { crCopy } from "@/lib/config/control-room-copy";
import { t } from "@/lib/utils/i18n";
import type { TimelineTask, TimelineTaskStatus, NarrativeEventDisplay } from "@/lib/types/controlRoom";
import type { PlaybackFrame } from "@/lib/visualization/propagationPlayback";
import {
  playbackReducer,
  INITIAL_PLAYBACK_STATE,
  createPlaybackController,
  formatPlaybackTime,
  type PlaybackAction,
  type PlaybackState,
} from "@/lib/visualization/timelinePlayback";
import {
  runDemoScenario,
  GULF_AIRSPACE_DISRUPTION,
} from "@/lib/visualization/demoScenarios";
import { setCurrentPlaybackFrame } from "./CenterGlobeStage";

const STATUS_COLOR: Record<TimelineTaskStatus, string> = {
  pending: "bg-white/10 border-white/10 text-white/50",
  in_progress: "bg-blue-500/20 border-blue-500/30 text-blue-300",
  completed: "bg-emerald-500/15 border-emerald-500/25 text-emerald-300",
  overdue: "bg-red-500/15 border-red-500/25 text-red-300",
  blocked: "bg-amber-500/15 border-amber-500/25 text-amber-300",
};

const DECISION_COLORS: Record<string, string> = {
  hold: "text-white/30",
  escalate: "text-yellow-400",
  activate_response: "text-amber-400",
  emergency_protocol: "text-red-400",
};

export function BottomExecutionTimeline() {
  const { state, dispatch: storeDispatch } = useControlRoomStore();
  const { tasks, timeline, lang, playback: storePlayback, narrativeEvents } = state;

  // Local playback state (not in store — high frequency updates)
  const [pbState, pbDispatch] = useReducer(playbackReducer, INITIAL_PLAYBACK_STATE);
  const pbStateRef = useRef(pbState);
  pbStateRef.current = pbState;

  const framesRef = useRef<PlaybackFrame[]>([]);
  const controllerRef = useRef<ReturnType<typeof createPlaybackController> | null>(null);
  const demoResultRef = useRef<ReturnType<typeof runDemoScenario> | null>(null);

  // Sync playback state to store (throttled)
  const lastSyncRef = useRef(0);
  const syncToStore = useCallback(
    (frame: PlaybackFrame | null, state: PlaybackState) => {
      const now = Date.now();
      if (now - lastSyncRef.current < 100) return; // Throttle to 10Hz
      lastSyncRef.current = now;

      if (frame) {
        storeDispatch({
          type: "UPDATE_PLAYBACK_FRAME",
          normalizedTime: state.normalizedTime,
          hoursElapsed: frame.hoursElapsed,
          affectedCount: frame.affectedCount,
          maxImpact: frame.maxImpact,
          currentDecision: frame.currentDecision,
          insurancePressure: frame.insurancePressure,
        });
      }

      // Update globe visualization
      setCurrentPlaybackFrame(frame);
    },
    [storeDispatch]
  );

  // Run demo scenario
  const handleRunDemo = useCallback(() => {
    const result = runDemoScenario(GULF_AIRSPACE_DISRUPTION);
    demoResultRef.current = result;
    framesRef.current = result.frames;

    pbDispatch({ type: "SET_TOTAL_FRAMES", total: result.frames.length });

    // Push narrative events to store
    const events: NarrativeEventDisplay[] = result.narrativeEvents.map((ev) => ({
      hour: ev.hour,
      normalizedTime: ev.normalizedTime,
      title: lang === "ar" ? ev.title.ar : ev.title.en,
      description: lang === "ar" ? ev.description.ar : ev.description.en,
      severity: ev.severity,
      relatedNodes: ev.relatedNodes,
      active: false,
    }));
    storeDispatch({ type: "SET_NARRATIVE_EVENTS", events });

    // Set playback status in store
    storeDispatch({
      type: "SET_PLAYBACK",
      playback: {
        ...storePlayback,
        status: "paused",
        totalFrames: result.frames.length,
        currentFrame: 0,
        normalizedTime: 0,
      },
    });

    // Create controller
    if (controllerRef.current) controllerRef.current.stop();
    controllerRef.current = createPlaybackController(
      () => pbStateRef.current,
      pbDispatch,
      syncToStore,
      result.frames
    );
  }, [lang, storeDispatch, storePlayback, syncToStore]);

  const handlePlay = useCallback(() => {
    pbDispatch({ type: "PLAY" });
    storeDispatch({
      type: "SET_PLAYBACK",
      playback: { ...storePlayback, status: "playing" },
    });
    controllerRef.current?.start();
  }, [storeDispatch, storePlayback]);

  const handlePause = useCallback(() => {
    pbDispatch({ type: "PAUSE" });
    storeDispatch({
      type: "SET_PLAYBACK",
      playback: { ...storePlayback, status: "paused" },
    });
    controllerRef.current?.stop();
  }, [storeDispatch, storePlayback]);

  const handleStop = useCallback(() => {
    pbDispatch({ type: "STOP" });
    controllerRef.current?.stop();
    setCurrentPlaybackFrame(null);
    storeDispatch({
      type: "SET_PLAYBACK",
      playback: { ...storePlayback, status: "idle", currentFrame: 0, normalizedTime: 0 },
    });
  }, [storeDispatch, storePlayback]);

  const handleScrub = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      pbDispatch({ type: "SEEK_NORMALIZED", time: pct });

      const frameIndex = Math.round(pct * (framesRef.current.length - 1));
      const frame = framesRef.current[frameIndex] ?? null;
      setCurrentPlaybackFrame(frame);
      syncToStore(frame, pbStateRef.current);
    },
    [syncToStore]
  );

  const handleSpeedChange = useCallback(() => {
    const speeds = [0.5, 1, 1.5, 2, 3];
    const currentIdx = speeds.indexOf(pbState.speed);
    const nextIdx = (currentIdx + 1) % speeds.length;
    pbDispatch({ type: "SET_SPEED", speed: speeds[nextIdx] });
  }, [pbState.speed]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      controllerRef.current?.stop();
      setCurrentPlaybackFrame(null);
    };
  }, []);

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

  const hasFrames = framesRef.current.length > 0;
  const isPlaying = pbState.status === "playing";
  const totalHours = demoResultRef.current?.scenario.expectedDuration ?? 72;

  return (
    <div
      className="flex flex-col border-t border-white/[0.06] bg-[#080c18]/80"
      style={{ gridArea: "timeline" }}
    >
      {/* ── Header with Playback Controls ── */}
      <div className="flex items-center justify-between border-b border-white/[0.04] px-4 py-1.5">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/30">
            {t(crCopy.timeline.title, lang)}
          </span>

          {/* Playback Controls */}
          <div className="flex items-center gap-1.5">
            {!hasFrames && (
              <button
                onClick={handleRunDemo}
                className="rounded border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[9px] font-medium text-amber-400 hover:bg-amber-500/20 transition-colors"
              >
                {lang === "ar" ? "تشغيل المحاكاة" : "Run Simulation"}
              </button>
            )}

            {hasFrames && (
              <>
                <button
                  onClick={isPlaying ? handlePause : handlePlay}
                  className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] text-white/50 hover:bg-white/10 transition-colors"
                >
                  {isPlaying ? "⏸" : "▶"}
                </button>
                <button
                  onClick={handleStop}
                  className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] text-white/50 hover:bg-white/10 transition-colors"
                >
                  ⏹
                </button>
                <button
                  onClick={handleSpeedChange}
                  className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[9px] font-mono text-white/40 hover:bg-white/10 transition-colors"
                >
                  {pbState.speed}x
                </button>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {hasFrames && (
            <span className={`text-[9px] font-mono ${DECISION_COLORS[storePlayback.currentDecision] ?? "text-white/30"}`}>
              {formatPlaybackTime(pbState.normalizedTime, totalHours)}
              {" · "}
              {storePlayback.affectedCount} nodes
              {" · "}
              {storePlayback.currentDecision.replace("_", " ")}
            </span>
          )}
          <span className="text-[9px] text-white/25">
            T₀ + {timeline.currentHour}h / {timeline.horizonHours}h
          </span>
        </div>
      </div>

      {/* ── Playback Scrub Bar ── */}
      {hasFrames && (
        <div className="relative h-6 border-b border-white/[0.04] cursor-pointer" onClick={handleScrub}>
          {/* Background */}
          <div className="absolute inset-0 bg-white/[0.02]" />

          {/* Progress fill */}
          <div
            className="absolute top-0 bottom-0 bg-blue-500/10"
            style={{ width: `${pbState.normalizedTime * 100}%` }}
          />

          {/* Narrative event markers */}
          {narrativeEvents.map((ev, i) => (
            <div
              key={i}
              className="absolute top-0 bottom-0 w-0.5"
              style={{
                left: `${ev.normalizedTime * 100}%`,
                backgroundColor: ev.severity === "critical"
                  ? "rgba(248,113,113,0.5)"
                  : ev.severity === "warning"
                  ? "rgba(251,191,36,0.4)"
                  : "rgba(96,165,250,0.3)",
              }}
            >
              {/* Tooltip dot */}
              <div
                className={`absolute -top-0.5 left-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full ${
                  ev.active ? "bg-white/60" : "bg-white/20"
                }`}
              />
            </div>
          ))}

          {/* Playhead */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-blue-400 z-10"
            style={{ left: `${pbState.normalizedTime * 100}%` }}
          >
            <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 h-2 w-2 rounded-full bg-blue-400 border border-blue-300" />
          </div>

          {/* Time labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct) => (
            <span
              key={pct}
              className="absolute bottom-0 text-[7px] text-white/15 -translate-x-1/2"
              style={{ left: `${pct * 100}%` }}
            >
              {Math.round(pct * totalHours)}h
            </span>
          ))}
        </div>
      )}

      {/* ── Task Lanes / Empty State ── */}
      {tasks.length === 0 && !hasFrames ? (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-[11px] text-white/25">
            {t(crCopy.timeline.noTasks, lang)}
          </p>
        </div>
      ) : (
        <div className="flex flex-1 overflow-x-auto">
          {/* Lane Labels */}
          <div className="flex shrink-0 flex-col border-r border-white/[0.04]" style={{ width: 100 }}>
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

          {/* Timeline Area */}
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
            {lanes.map(([laneName, laneTasks]) => (
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
