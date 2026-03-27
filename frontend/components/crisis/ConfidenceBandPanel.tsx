"use client";

import type { ConfidenceBand } from "@/lib/types/decision-intelligence";

interface Props {
  bands: ConfidenceBand[] | undefined;
  overallConfidence: number | undefined;
}

export function ConfidenceBandPanel({ bands, overallConfidence }: Props) {
  if (!bands || bands.length === 0) {
    return (
      <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] p-5">
        <p className="text-xs uppercase tracking-[0.3em] text-blue-300/70">
          Confidence Bands
        </p>
        <p className="mt-3 text-sm text-white/30">No confidence data</p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] p-5 space-y-4">
      {/* Header + Overall */}
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.3em] text-blue-300/70">
          Confidence Bands
        </p>
        {overallConfidence != null && (
          <span className="text-sm font-medium text-white/60">
            Overall: {Math.round(overallConfidence * 100)}%
          </span>
        )}
      </div>

      {/* Bands */}
      <div className="space-y-4">
        {bands.map((band) => {
          // Compute positions as % of 0–1 range
          const lowerPct = Math.round(band.lower_bound * 100);
          const centralPct = Math.round(band.central_estimate * 100);
          const upperPct = Math.round(band.upper_bound * 100);

          return (
            <div key={band.metric} className="space-y-2">
              {/* Label + Values */}
              <div className="flex items-center justify-between">
                <p className="text-xs text-white/60">{band.metric}</p>
                <span className="text-[10px] text-white/30">
                  {Math.round(band.confidence_level * 100)}% confidence
                </span>
              </div>

              {/* Visual Band */}
              <div className="relative h-6 rounded-lg bg-white/[0.04]">
                {/* Range bar */}
                <div
                  className="absolute top-1 bottom-1 rounded bg-blue-500/20"
                  style={{
                    left: `${lowerPct}%`,
                    width: `${upperPct - lowerPct}%`,
                  }}
                />
                {/* Central dot */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-blue-400 border-2 border-[#06070B]"
                  style={{ left: `${centralPct}%` }}
                />
              </div>

              {/* Numeric labels */}
              <div className="flex justify-between text-[10px] text-white/30">
                <span>{lowerPct}%</span>
                <span className="text-white/50 font-medium">{centralPct}%</span>
                <span>{upperPct}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
