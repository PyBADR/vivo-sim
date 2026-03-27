/* ── Timeline Playback Engine ──
   Manages play/pause/scrub/reset state for the propagation visualization.
   Runs on requestAnimationFrame for smooth 60fps updates.

   Single source of truth for playback position.
   All visual components subscribe to the current frame. */

import type { PlaybackFrame } from "./propagationPlayback";

/* ── Playback State ── */

export type PlaybackStatus = "idle" | "playing" | "paused" | "complete";

export interface PlaybackState {
  status: PlaybackStatus;
  currentFrame: number;
  totalFrames: number;
  normalizedTime: number;        // 0-1
  speed: number;                 // 1.0 = normal, 0.5 = half, 2.0 = double
  loop: boolean;
  direction: "forward" | "reverse";
}

export const INITIAL_PLAYBACK_STATE: PlaybackState = {
  status: "idle",
  currentFrame: 0,
  totalFrames: 0,
  normalizedTime: 0,
  speed: 1.0,
  loop: false,
  direction: "forward",
};

/* ── Playback Actions ── */

export type PlaybackAction =
  | { type: "PLAY" }
  | { type: "PAUSE" }
  | { type: "STOP" }
  | { type: "RESET" }
  | { type: "SEEK"; frame: number }
  | { type: "SEEK_NORMALIZED"; time: number }
  | { type: "SET_SPEED"; speed: number }
  | { type: "TOGGLE_LOOP" }
  | { type: "REVERSE" }
  | { type: "STEP_FORWARD" }
  | { type: "STEP_BACKWARD" }
  | { type: "SET_TOTAL_FRAMES"; total: number }
  | { type: "TICK" };

/* ── Playback Reducer ── */

export function playbackReducer(
  state: PlaybackState,
  action: PlaybackAction
): PlaybackState {
  switch (action.type) {
    case "PLAY":
      if (state.totalFrames === 0) return state;
      return {
        ...state,
        status: "playing",
        currentFrame: state.status === "complete" ? 0 : state.currentFrame,
        normalizedTime: state.status === "complete" ? 0 : state.normalizedTime,
      };

    case "PAUSE":
      return { ...state, status: state.status === "playing" ? "paused" : state.status };

    case "STOP":
      return { ...state, status: "idle", currentFrame: 0, normalizedTime: 0 };

    case "RESET":
      return { ...state, status: "idle", currentFrame: 0, normalizedTime: 0 };

    case "SEEK": {
      const clamped = Math.max(0, Math.min(action.frame, state.totalFrames - 1));
      return {
        ...state,
        currentFrame: clamped,
        normalizedTime: state.totalFrames > 1 ? clamped / (state.totalFrames - 1) : 0,
        status: state.status === "complete" ? "paused" : state.status,
      };
    }

    case "SEEK_NORMALIZED": {
      const t = Math.max(0, Math.min(action.time, 1));
      const frame = Math.round(t * (state.totalFrames - 1));
      return {
        ...state,
        currentFrame: frame,
        normalizedTime: t,
        status: state.status === "complete" ? "paused" : state.status,
      };
    }

    case "SET_SPEED":
      return { ...state, speed: Math.max(0.25, Math.min(action.speed, 4.0)) };

    case "TOGGLE_LOOP":
      return { ...state, loop: !state.loop };

    case "REVERSE":
      return { ...state, direction: state.direction === "forward" ? "reverse" : "forward" };

    case "STEP_FORWARD": {
      const next = Math.min(state.currentFrame + 1, state.totalFrames - 1);
      return {
        ...state,
        currentFrame: next,
        normalizedTime: state.totalFrames > 1 ? next / (state.totalFrames - 1) : 0,
        status: "paused",
      };
    }

    case "STEP_BACKWARD": {
      const prev = Math.max(state.currentFrame - 1, 0);
      return {
        ...state,
        currentFrame: prev,
        normalizedTime: state.totalFrames > 1 ? prev / (state.totalFrames - 1) : 0,
        status: "paused",
      };
    }

    case "SET_TOTAL_FRAMES":
      return { ...state, totalFrames: action.total, currentFrame: 0, normalizedTime: 0 };

    case "TICK": {
      if (state.status !== "playing") return state;
      const step = state.direction === "forward" ? 1 : -1;
      const next = state.currentFrame + step;

      if (next >= state.totalFrames) {
        if (state.loop) {
          return { ...state, currentFrame: 0, normalizedTime: 0 };
        }
        return {
          ...state,
          status: "complete",
          currentFrame: state.totalFrames - 1,
          normalizedTime: 1,
        };
      }

      if (next < 0) {
        if (state.loop) {
          return {
            ...state,
            currentFrame: state.totalFrames - 1,
            normalizedTime: 1,
          };
        }
        return { ...state, status: "complete", currentFrame: 0, normalizedTime: 0 };
      }

      return {
        ...state,
        currentFrame: next,
        normalizedTime: state.totalFrames > 1 ? next / (state.totalFrames - 1) : 0,
      };
    }

    default:
      return state;
  }
}

/* ── RAF-Based Playback Controller ──
   Call `createPlaybackController` to get start/stop handles.
   The onFrame callback fires every animation frame with the current frame data. */

export interface PlaybackController {
  start: () => void;
  stop: () => void;
  isRunning: () => boolean;
}

export function createPlaybackController(
  getState: () => PlaybackState,
  dispatch: (action: PlaybackAction) => void,
  onFrame: (frame: PlaybackFrame | null, state: PlaybackState) => void,
  frames: PlaybackFrame[]
): PlaybackController {
  let rafId: number | null = null;
  let lastTime = 0;
  let accumulator = 0;
  const BASE_FRAME_MS = 1000 / 60; // 60fps base rate

  function tick(timestamp: number) {
    const state = getState();

    if (state.status !== "playing") {
      rafId = null;
      return;
    }

    if (lastTime === 0) lastTime = timestamp;
    const delta = timestamp - lastTime;
    lastTime = timestamp;

    // Accumulate time, advance when enough for one frame at current speed
    accumulator += delta * state.speed;

    if (accumulator >= BASE_FRAME_MS) {
      accumulator -= BASE_FRAME_MS;
      dispatch({ type: "TICK" });

      const updatedState = getState();
      const currentFrame = frames[updatedState.currentFrame] ?? null;
      onFrame(currentFrame, updatedState);
    }

    rafId = requestAnimationFrame(tick);
  }

  return {
    start() {
      if (rafId !== null) return;
      lastTime = 0;
      accumulator = 0;
      rafId = requestAnimationFrame(tick);
    },
    stop() {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      lastTime = 0;
      accumulator = 0;
    },
    isRunning() {
      return rafId !== null;
    },
  };
}

/* ── Format Helpers ── */

export function formatPlaybackTime(normalizedTime: number, totalHours: number): string {
  const hours = Math.round(normalizedTime * totalHours);
  if (hours < 1) return "T+0h";
  if (hours < 24) return `T+${hours}h`;
  const days = Math.floor(hours / 24);
  const rem = hours % 24;
  return `T+${days}d ${rem}h`;
}

export function playbackProgressPct(state: PlaybackState): number {
  return Math.round(state.normalizedTime * 100);
}
