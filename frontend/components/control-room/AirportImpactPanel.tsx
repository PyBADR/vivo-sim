"use client";

import type { AirportImpact } from "@/lib/types/crisis";
import { decisionCopy } from "@/lib/config/decision-copy";
import { t } from "@/lib/utils/i18n";
import type { Lang } from "@/lib/types/i18n";

interface Props {
  airports: AirportImpact[];
  lang?: Lang;
}

function getScoreColor(score: number): string {
  if (score >= 0.7) return "text-red-400";
  if (score >= 0.5) return "text-amber-400";
  return "text-blue-300";
}

export function AirportImpactPanel({ airports, lang = "en" }: Props) {
  const c = decisionCopy.impact.aviation;

  if (!airports || airports.length === 0) {
    return (
      <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] p-5">
        <p className="text-xs uppercase tracking-[0.3em] text-white/40">
          {t(c.title, lang)}
        </p>
        <p className="mt-3 text-sm text-white/30">{t(c.noData, lang)}</p>
      </div>
    );
  }

  const sorted = [...airports].sort((a, b) => b.disruption_score - a.disruption_score);

  return (
    <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] p-5 space-y-4">
      <p className="text-xs uppercase tracking-[0.3em] text-white/40">
        {t(c.title, lang)}
      </p>

      <div className="space-y-3">
        {sorted.map((airport) => (
          <div key={airport.airport_code} className="rounded-2xl border border-white/[0.04] bg-black/20 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">{airport.airport_name}</p>
                <p className="text-xs text-white/45">{airport.airport_code}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-wider text-white/30">{t(c.score, lang)}</p>
                <p className={`text-lg font-semibold ${getScoreColor(airport.disruption_score)}`}>
                  {Math.round(airport.disruption_score * 100)}%
                </p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-[10px] text-white/45">
              <div className="flex justify-between">
                <span>{t(c.rerouting, lang)}</span>
                <span>{Math.round(airport.rerouting_pressure * 100)}%</span>
              </div>
              <div className="flex justify-between">
                <span>{t(c.fuel, lang)}</span>
                <span>{Math.round(airport.fuel_stress * 100)}%</span>
              </div>
              <div className="flex justify-between">
                <span>{t(c.congestion, lang)}</span>
                <span>{Math.round(airport.congestion_pressure * 100)}%</span>
              </div>
              <div className="flex justify-between">
                <span>{t(c.insurance, lang)}</span>
                <span>{Math.round(airport.insurance_operating_stress * 100)}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
