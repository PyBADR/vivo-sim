"use client";

import type { DecisionWindow } from "@/lib/types/decision-intelligence";

interface Props {
  windows: DecisionWindow[] | undefined;
}

const URGENCY_STYLES: Record<string, { border: string; bg: string; text: string; dot: string }> = {
  critical: {
    border: "border-red-500/20",
    bg: "bg-red-500/5",
    text: "text-red-300",
    dot: "bg-red-400",
  },
  high: {
    border: "border-amber-500/20",
    bg: "bg-amber-500/5",
    text: "text-amber-300",
    dot: "bg-amber-400",
  },
  medium: {
    border: "border-blue-500/20",
    bg: "bg-blue-500/5",
    text: "text-blue-300",
    dot: "bg-blue-400",
  },
  low: {
    border: "border-white/[0.08]",
    bg: "bg-white/[0.02]",
    text: "text-white/60",
    dot: "bg-white/40",
  },
};

export function DecisionWindowPanel({ windows }: Props) {
  if (!windows || windows.length === 0) {
    return (
      <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] p-5">
        <p className="text-xs uppercase tracking-[0.3em] text-blue-300/70">
          Decision Windows
        </p>
        <p className="mt-3 text-sm text-white/30">No active windows</p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] p-5 space-y-4">
      <p className="text-xs uppercase tracking-[0.3em] text-blue-300/70">
        Decision Windows
      </p>

      {/* Timeline */}
      <div className="relative space-y-3">
        {/* Vertical line */}
        <div className="absolute left-[7px] top-2 bottom-2 w-px bg-white/[0.06]" />

        {windows.map((win) => {
          const style = URGENCY_STYLES[win.urgency] ?? URGENCY_STYLES.low;
          return (
            <div key={win.window_id} className="relative pl-6">
              {/* Dot */}
              <div
                className={`absolute left-0 top-2 h-3.5 w-3.5 rounded-full border-2 border-[#06070B] ${style.dot}`}
              />

              <div
                className={`rounded-2xl border p-4 space-y-2 ${style.border} ${style.bg}`}
              >
                {/* Title + Time Range */}
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-white/80">
                    {win.title}
                  </h4>
                  <span className={`text-[10px] uppercase tracking-wider ${style.text}`}>
                    {win.urgency}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-white/40">
                  <span>{win.opens}</span>
                  <span className="text-white/20">→</span>
                  <span>{win.closes}</span>
                </div>

                {/* Available Actions */}
                {win.actions_available.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {win.actions_available.map((actionId) => (
                      <span
                        key={actionId}
                        className="rounded-full border border-white/[0.06] bg-white/[0.03] px-2 py-0.5 text-[10px] text-white/40"
                      >
                        {actionId.replace("opt_", "").replace(/_/g, " ")}
                      </span>
                    ))}
                  </div>
                )}

                {/* Cost of Delay */}
                <div className="rounded-xl bg-white/[0.03] px-3 py-2">
                  <p className="text-[10px] uppercase tracking-wider text-white/30 mb-0.5">
                    Cost of Delay
                  </p>
                  <p className="text-[11px] text-white/50 leading-relaxed">
                    {win.cost_of_delay}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
