"use client";

/* ── Impact Summary Strip ──
   Compact high-priority strip between Command Bar and the main grid.
   Answers in 5 seconds: How many entities? Peak risk? Top sectors? Top line? Decision state?
   Only visible during active playback with decision clarity data. */

import { useControlRoomStore } from "@/lib/state/controlRoomStore";
import { crCopy } from "@/lib/config/control-room-copy";
import { t } from "@/lib/utils/i18n";
import type { DecisionClarityResult } from "@/lib/decision/decisionClarity";
import type { CopyPair } from "@/lib/types/i18n";

const DECISION_STRIP_COLOR: Record<string, string> = {
  hold: "text-white/40",
  escalate: "text-yellow-400",
  activate_response: "text-amber-400",
  emergency_protocol: "text-red-400",
};

const DECISION_STRIP_BG: Record<string, string> = {
  hold: "bg-white/[0.02]",
  escalate: "bg-yellow-500/[0.03]",
  activate_response: "bg-amber-500/[0.04]",
  emergency_protocol: "bg-red-500/[0.04]",
};

export function ImpactSummaryStrip() {
  const { state } = useControlRoomStore();
  const { playback, decisionClarity, lang } = state;

  const isActive = playback.status !== "idle";
  const clarity = decisionClarity as DecisionClarityResult | null;

  if (!isActive || !clarity) return null;

  const stateKey = playback.currentDecision as keyof typeof crCopy.decisionStates;
  const stateLabel = crCopy.decisionStates[stateKey] as CopyPair | undefined;
  const topLine = clarity.topExposedLines[0];
  const sectors = new Set(clarity.affectedEntities.map((e) => e.sector));

  return (
    <div
      className={`flex items-center justify-between border-b border-white/[0.04] px-4 py-1 ${DECISION_STRIP_BG[playback.currentDecision] ?? "bg-white/[0.02]"}`}
      style={{ gridArea: "strip" }}
    >
      {/* Left: Decision State + Interpretation */}
      <div className="flex items-center gap-3 min-w-0">
        <span className={`text-[10px] font-bold tracking-wider shrink-0 ${DECISION_STRIP_COLOR[playback.currentDecision] ?? "text-white/40"}`}>
          {stateLabel ? t(stateLabel, lang) : playback.currentDecision.replace("_", " ").toUpperCase()}
        </span>
        <span className="text-[9px] text-white/40 truncate hidden sm:inline">
          {lang === "ar" ? clarity.executiveInterpretation.ar : clarity.executiveInterpretation.en}
        </span>
      </div>

      {/* Right: Key Metrics */}
      <div className="flex items-center gap-4 shrink-0">
        <StripMetric
          label={t(crCopy.impactSummary.entities, lang)}
          value={String(clarity.affectedEntities.length)}
        />
        <StripMetric
          label={t(crCopy.impactSummary.sectors, lang)}
          value={String(sectors.size)}
        />
        <StripMetric
          label={t(crCopy.impactSummary.peakRisk, lang)}
          value={`${Math.round(clarity.finalRisk * 100)}%`}
          alert={clarity.finalRisk >= 0.6}
        />
        {topLine && (
          <StripMetric
            label={t(crCopy.impactSummary.topLine, lang)}
            value={`${lang === "ar" ? topLine.displayName.ar : topLine.displayName.en} ${topLine.exposureScore}%`}
            alert={topLine.exposureScore >= 30}
          />
        )}
      </div>
    </div>
  );
}

function StripMetric({ label, value, alert }: { label: string; value: string; alert?: boolean }) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-[8px] text-white/25">{label}</span>
      <span className={`text-[9px] font-mono font-medium ${alert ? "text-amber-400" : "text-white/55"}`}>
        {value}
      </span>
    </div>
  );
}
