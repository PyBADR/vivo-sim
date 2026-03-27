"use client";

import type { ConfidenceBand } from "@/lib/types/decision-intelligence";
import { decisionCopy } from "@/lib/config/decision-copy";
import { t } from "@/lib/utils/i18n";
import type { Lang } from "@/lib/types/i18n";

interface Props {
  bands?: ConfidenceBand[];
  overallConfidence?: number;
  lang?: Lang;
}

function getConfidenceColor(value: number): string {
  if (value >= 0.75) return "text-emerald-400";
  if (value >= 0.5) return "text-blue-400";
  if (value >= 0.25) return "text-amber-400";
  return "text-red-400";
}

function getConfidenceBg(value: number): string {
  if (value >= 0.75) return "bg-emerald-400";
  if (value >= 0.5) return "bg-blue-400";
  if (value >= 0.25) return "bg-amber-400";
  return "bg-red-400";
}

export function ConfidencePanel({ bands, overallConfidence, lang = "en" }: Props) {
  const c = decisionCopy.confidence;

  if (!bands || bands.length === 0) {
    return (
      <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] p-5">
        <p className="text-xs uppercase tracking-[0.3em] text-blue-300/70">
          {t(c.title, lang)}
        </p>
        <p className="mt-3 text-sm text-white/30">{t(c.noData, lang)}</p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] p-5 space-y-4">
      {/* Header + Overall */}
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.3em] text-blue-300/70">
          {t(c.title, lang)}
        </p>
        {overallConfidence != null && (
          <span className={`text-sm font-medium ${getConfidenceColor(overallConfidence)}`}>
            {t(c.overall, lang)}: {Math.round(overallConfidence * 100)}%
          </span>
        )}
      </div>

      {/* Overall confidence arc */}
      {overallConfidence != null && (
        <div className="flex items-center gap-3">
          <div className="relative h-16 w-16 shrink-0">
            <svg viewBox="0 0 36 36" className="h-16 w-16 -rotate-90">
              <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
              <circle
                cx="18" cy="18" r="15" fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeDasharray={`${overallConfidence * 94.25} 94.25`}
                strokeLinecap="round"
                className={getConfidenceColor(overallConfidence)}
              />
            </svg>
            <span className={`absolute inset-0 flex items-center justify-center text-sm font-semibold ${getConfidenceColor(overallConfidence)}`}>
              {Math.round(overallConfidence * 100)}%
            </span>
          </div>
          <p className="text-xs text-white/40 leading-relaxed">
            {t(c.explanation, lang)}
          </p>
        </div>
      )}

      {/* Individual Bands */}
      <div className="space-y-4">
        {bands.map((band) => {
          const lowerPct = Math.round(band.lower_bound * 100);
          const centralPct = Math.round(band.central_estimate * 100);
          const upperPct = Math.round(band.upper_bound * 100);

          return (
            <div key={band.metric} className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs text-white/60">{band.metric}</p>
                <span className="text-[10px] text-white/30">
                  {Math.round(band.confidence_level * 100)}% {t(c.band, lang)}
                </span>
              </div>

              {/* Visual Band */}
              <div className="relative h-6 rounded-lg bg-white/[0.04]">
                <div
                  className="absolute top-1 bottom-1 rounded bg-blue-500/20"
                  style={{ left: `${lowerPct}%`, width: `${Math.max(upperPct - lowerPct, 1)}%` }}
                />
                <div
                  className={`absolute top-1/2 -translate-y-1/2 h-3 w-3 rounded-full ${getConfidenceBg(band.confidence_level)} border-2 border-[#06070B]`}
                  style={{ left: `${centralPct}%` }}
                />
              </div>

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
