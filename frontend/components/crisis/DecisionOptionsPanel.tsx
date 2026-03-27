"use client";

import type { DecisionOption } from "@/lib/types/decision-intelligence";

interface Props {
  options: DecisionOption[] | undefined;
}

const RECOMMENDATION_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  strongly_recommended: {
    bg: "bg-emerald-500/10 border-emerald-500/20",
    text: "text-emerald-300",
    label: "Strongly Recommended",
  },
  recommended: {
    bg: "bg-blue-500/10 border-blue-500/20",
    text: "text-blue-300",
    label: "Recommended",
  },
  conditional: {
    bg: "bg-amber-500/10 border-amber-500/20",
    text: "text-amber-300",
    label: "Conditional",
  },
  not_recommended: {
    bg: "bg-red-500/10 border-red-500/20",
    text: "text-red-300",
    label: "Not Recommended",
  },
};

export function DecisionOptionsPanel({ options }: Props) {
  if (!options || options.length === 0) {
    return (
      <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] p-5">
        <p className="text-xs uppercase tracking-[0.3em] text-blue-300/70">
          Decision Options
        </p>
        <p className="mt-3 text-sm text-white/30">No options available</p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] p-5 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.3em] text-blue-300/70">
          Decision Options
        </p>
        <span className="text-xs text-white/30">{options.length} options</span>
      </div>

      <div className="space-y-3">
        {options.map((opt) => {
          const style = RECOMMENDATION_STYLES[opt.recommendation] ?? RECOMMENDATION_STYLES.conditional;
          return (
            <div
              key={opt.option_id}
              className={`rounded-2xl border p-4 space-y-3 ${style.bg}`}
            >
              {/* Title + Badge */}
              <div className="flex items-start justify-between gap-3">
                <h4 className="text-sm font-medium text-white/90">
                  {opt.title}
                </h4>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wider ${style.text} border ${style.bg}`}
                >
                  {style.label}
                </span>
              </div>

              {/* Description */}
              <p className="text-xs text-white/60 leading-relaxed">
                {opt.description}
              </p>

              {/* Metrics Row */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-white/30">
                    Risk Reduction
                  </p>
                  <p className="text-sm font-medium text-white/80">
                    {Math.round(opt.risk_reduction * 100)}%
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-white/30">
                    Cost
                  </p>
                  <p className="text-xs text-white/60">{opt.cost_estimate}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-white/30">
                    Time
                  </p>
                  <p className="text-xs text-white/60">
                    {opt.time_to_implement}
                  </p>
                </div>
              </div>

              {/* Confidence Bar */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[10px] uppercase tracking-wider text-white/30">
                    Confidence
                  </p>
                  <span className="text-[10px] text-white/40">
                    {Math.round(opt.confidence * 100)}%
                  </span>
                </div>
                <div className="h-1 rounded-full bg-white/[0.06]">
                  <div
                    className="h-1 rounded-full bg-blue-400/60 transition-all"
                    style={{ width: `${opt.confidence * 100}%` }}
                  />
                </div>
              </div>

              {/* Trade-offs */}
              {opt.trade_offs.length > 0 && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-white/30 mb-1">
                    Trade-offs
                  </p>
                  <div className="space-y-1">
                    {opt.trade_offs.map((t, i) => (
                      <p key={i} className="text-[11px] text-white/40 pl-2 border-l border-white/[0.06]">
                        {t}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
