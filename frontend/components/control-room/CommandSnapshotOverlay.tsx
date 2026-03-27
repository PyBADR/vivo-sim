"use client";

/* ── Command Snapshot Overlay ──
   Dominant top-center overlay above the globe stage.
   The first thing a viewer understands.
   Answers in 5 seconds: situation, impact, exposure, risk, decision, action, why, timing.
   Compact, high-contrast, enterprise tone. Does not hide critical map context. */

import { useControlRoomStore } from "@/lib/state/controlRoomStore";
import { crCopy } from "@/lib/config/control-room-copy";
import { t } from "@/lib/utils/i18n";
import type { CommandSnapshot, TimeToImpactEntry, TimeBand } from "@/lib/demo/commandSnapshot";
import type { CopyPair } from "@/lib/types/i18n";
import { getCurrentStage, GULF_AIRSPACE_STAGES } from "@/lib/demo/demoMode";

/* ── Decision Color Config ── */

const DECISION_CONFIG: Record<string, { color: string; bg: string; border: string; glow: string }> = {
  hold:              { color: "text-white/40",   bg: "bg-white/[0.02]",    border: "border-white/[0.06]",     glow: "" },
  escalate:          { color: "text-yellow-400", bg: "bg-yellow-500/[0.04]", border: "border-yellow-500/20", glow: "shadow-[0_0_20px_rgba(234,179,8,0.12)]" },
  activate_response: { color: "text-amber-400",  bg: "bg-amber-500/[0.05]", border: "border-amber-500/25",   glow: "shadow-[0_0_24px_rgba(245,158,11,0.15)]" },
  emergency_protocol:{ color: "text-red-400",    bg: "bg-red-500/[0.06]",   border: "border-red-500/25",     glow: "shadow-[0_0_30px_rgba(239,68,68,0.2)]" },
};

const BAND_COLOR: Record<TimeBand, string> = {
  immediate:      "text-red-400",
  plus_12h:       "text-amber-400",
  plus_24_48h:    "text-blue-400",
  medium_horizon: "text-white/40",
};

const CONFIDENCE_COLOR: Record<string, string> = {
  high:     "text-emerald-400",
  moderate: "text-amber-400",
  low:      "text-red-400",
};

export function CommandSnapshotOverlay() {
  const { state } = useControlRoomStore();
  const { playback, commandSnapshot, lang } = state;

  const isActive = playback.status !== "idle";
  const snapshot = commandSnapshot as CommandSnapshot | null;

  if (!isActive || !snapshot) return null;

  const config = DECISION_CONFIG[snapshot.decisionState] ?? DECISION_CONFIG.hold;
  const stateKey = snapshot.decisionState as keyof typeof crCopy.decisionStates;
  const stateLabel = crCopy.decisionStates[stateKey] as CopyPair | undefined;

  // Current stage
  const stage = getCurrentStage(playback.normalizedTime);

  return (
    <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 w-[580px] max-w-[calc(100%-40px)]">
      <div className={`rounded-xl border backdrop-blur-md ${config.bg} ${config.border} ${config.glow} transition-all duration-500`}>
        {/* ── Row 1: Situation + Decision Badge ── */}
        <div className="flex items-start justify-between gap-3 px-4 pt-3 pb-1.5">
          <div className="flex-1 min-w-0">
            {/* Stage indicator */}
            {stage && (
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-[7px] uppercase tracking-[0.15em] text-white/25">
                  {lang === "ar" ? "المرحلة" : "Stage"} {getCurrentStageIndex(playback.normalizedTime) + 1}/{GULF_AIRSPACE_STAGES.length}
                </span>
                <span className="text-[8px] text-white/30">·</span>
                <span className="text-[8px] text-white/35">
                  {lang === "ar" ? stage.title.ar : stage.title.en}
                </span>
              </div>
            )}
            {/* Headline */}
            <h2 className="text-[14px] font-semibold text-white/90 leading-tight">
              {lang === "ar" ? snapshot.headline.ar : snapshot.headline.en}
            </h2>
            {/* Subheadline */}
            <p className="text-[10px] text-white/45 mt-0.5 leading-snug">
              {lang === "ar" ? snapshot.subheadline.ar : snapshot.subheadline.en}
            </p>
          </div>

          {/* Decision + Risk Badge */}
          <div className="shrink-0 flex flex-col items-end gap-1">
            <div className={`rounded-lg border px-2.5 py-1 ${config.bg} ${config.border}`}>
              <span className={`text-[11px] font-bold tracking-wider ${config.color}`}>
                {stateLabel ? t(stateLabel, lang) : snapshot.decisionState.replace("_", " ").toUpperCase()}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[8px] text-white/25">{t(crCopy.snapshot.peakRisk, lang)}</span>
              <span className={`text-[12px] font-mono font-bold ${snapshot.peakRiskScore >= 70 ? "text-red-400" : snapshot.peakRiskScore >= 40 ? "text-amber-400" : "text-blue-400"}`}>
                {snapshot.peakRiskScore}
              </span>
            </div>
          </div>
        </div>

        {/* ── Row 2: Compact Metrics ── */}
        <div className="flex items-center gap-4 px-4 pb-2 border-b border-white/[0.04]">
          <SnapshotMetric
            label={t(crCopy.snapshot.impact, lang)}
            value={`${snapshot.affectedEntitiesCount} ${lang === "ar" ? "جهة" : "entities"}`}
          />
          <SnapshotMetric
            label={t(crCopy.snapshot.exposure, lang)}
            value={snapshot.topExposedLines.map((l) => lang === "ar" ? l.name.ar : l.name.en).join(" + ")}
            alert
          />
          <SnapshotMetric
            label={t(crCopy.snapshot.sectors, lang)}
            value={snapshot.topAffectedSectors.slice(0, 3).join(", ")}
          />
        </div>

        {/* ── Row 3: Action + Why + Confidence ── */}
        <div className="px-4 py-2 space-y-1.5">
          {/* Immediate Action */}
          <div className="flex items-start gap-2">
            <span className="text-[8px] uppercase tracking-wider text-white/25 shrink-0 mt-0.5 w-16">
              {t(crCopy.snapshot.action, lang)}
            </span>
            <p className="text-[10px] text-white/65 leading-snug font-medium">
              {lang === "ar" ? snapshot.immediateAction.ar : snapshot.immediateAction.en}
            </p>
          </div>

          {/* Why It Matters */}
          <div className="flex items-start gap-2">
            <span className="text-[8px] uppercase tracking-wider text-white/25 shrink-0 mt-0.5 w-16">
              {t(crCopy.snapshot.whyItMatters, lang)}
            </span>
            <p className="text-[9px] text-white/40 leading-snug">
              {lang === "ar" ? snapshot.whyItMatters.ar : snapshot.whyItMatters.en}
            </p>
          </div>

          {/* Confidence */}
          <div className="flex items-center gap-2">
            <span className="text-[8px] uppercase tracking-wider text-white/25 shrink-0 w-16">
              {t(crCopy.snapshot.confidence, lang)}
            </span>
            <span className={`text-[9px] ${CONFIDENCE_COLOR[snapshot.confidenceNarrative.level] ?? "text-white/40"}`}>
              {lang === "ar" ? snapshot.confidenceNarrative.text.ar : snapshot.confidenceNarrative.text.en}
            </span>
          </div>
        </div>

        {/* ── Row 4: Time to Impact Band ── */}
        {snapshot.timeToImpact.length > 0 && (
          <div className="flex items-stretch border-t border-white/[0.04] divide-x divide-white/[0.04]">
            {snapshot.timeToImpact.map((entry) => (
              <TimeImpactCell key={entry.band} entry={entry} lang={lang} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Sub-components ── */

function SnapshotMetric({ label, value, alert }: { label: string; value: string; alert?: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[7px] uppercase tracking-wider text-white/25">{label}</span>
      <span className={`text-[9px] font-medium ${alert ? "text-amber-400" : "text-white/55"}`}>
        {value}
      </span>
    </div>
  );
}

function TimeImpactCell({ entry, lang }: { entry: TimeToImpactEntry; lang: "en" | "ar" }) {
  return (
    <div className="flex-1 px-3 py-1.5">
      <span className={`text-[8px] font-bold ${BAND_COLOR[entry.band]}`}>
        {lang === "ar" ? entry.label.ar : entry.label.en}
      </span>
      <p className="text-[8px] text-white/35 mt-0.5 leading-snug line-clamp-1">
        {lang === "ar" ? entry.consequence.ar : entry.consequence.en}
      </p>
    </div>
  );
}

/* ── Helper re-exported from demoMode ── */

function getCurrentStageIndex(normalizedTime: number): number {
  for (let i = GULF_AIRSPACE_STAGES.length - 1; i >= 0; i--) {
    if (normalizedTime >= GULF_AIRSPACE_STAGES[i].normalizedTimeStart) return i;
  }
  return 0;
}
