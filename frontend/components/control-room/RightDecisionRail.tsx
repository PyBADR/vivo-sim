"use client";

import { useControlRoomStore } from "@/lib/state/controlRoomStore";
import { crCopy } from "@/lib/config/control-room-copy";
import { t } from "@/lib/utils/i18n";
import { threatColor } from "@/lib/theme/command-center-theme";
import type { CourseOfAction } from "@/lib/types/controlRoom";

const REC_COLOR: Record<string, string> = {
  strongly_recommended: "text-emerald-400 border-emerald-400/25 bg-emerald-400/10",
  recommended: "text-blue-400 border-blue-400/25 bg-blue-400/10",
  conditional: "text-amber-400 border-amber-400/25 bg-amber-400/10",
  not_recommended: "text-red-400 border-red-400/25 bg-red-400/10",
};

const REC_LABEL: Record<string, keyof typeof crCopy.decision> = {
  strongly_recommended: "stronglyRecommended",
  recommended: "recommended",
  conditional: "conditional",
  not_recommended: "notRecommended",
};

export function RightDecisionRail() {
  const { state, dispatch } = useControlRoomStore();
  const { coursesOfAction, selectedCOAId, lang, diBundle } = state;

  return (
    <aside
      className="flex flex-col gap-3 overflow-y-auto border-l border-white/[0.06] bg-[#080c18]/60 p-3"
      style={{ gridArea: "right" }}
    >
      {/* ── Section Title ── */}
      <div className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/30">
        {t(crCopy.decision.title, lang)}
      </div>

      {/* ── Overall Confidence ── */}
      {diBundle && (
        <div className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">
          <span className="text-[10px] uppercase tracking-wider text-white/35">
            {t(crCopy.commandBar.confidence, lang)}
          </span>
          <span className="text-sm font-semibold text-blue-300">
            {Math.round(diBundle.overall_confidence * 100)}%
          </span>
        </div>
      )}

      {/* ── Courses of Action ── */}
      {coursesOfAction.length > 0 ? (
        <div className="space-y-2">
          <span className="text-[9px] uppercase tracking-[0.25em] text-white/30">
            {t(crCopy.decision.coursesOfAction, lang)}
          </span>
          {coursesOfAction.map((coa) => (
            <COACard
              key={coa.id}
              coa={coa}
              isSelected={selectedCOAId === coa.id}
              lang={lang}
              onSelect={() => dispatch({ type: "SELECT_COA", coaId: coa.id })}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
          <p className="text-[11px] text-white/30 text-center">
            {t(crCopy.decision.noCOA, lang)}
          </p>
        </div>
      )}
    </aside>
  );
}

/* ── Course of Action Card ── */

function COACard({
  coa,
  isSelected,
  lang,
  onSelect,
}: {
  coa: CourseOfAction;
  isSelected: boolean;
  lang: "en" | "ar";
  onSelect: () => void;
}) {
  const recKey = REC_LABEL[coa.recommendation] ?? "recommended";
  const recStyle = REC_COLOR[coa.recommendation] ?? REC_COLOR.recommended;

  return (
    <div
      className={`rounded-xl border p-3 space-y-2.5 transition-all cursor-pointer ${
        isSelected
          ? "border-blue-500/30 bg-blue-500/[0.06]"
          : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]"
      }`}
      onClick={onSelect}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <p className="text-[12px] font-medium text-white/90 leading-snug flex-1">
          {coa.title}
        </p>
        <span
          className={`shrink-0 rounded-full border px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider ${recStyle}`}
        >
          {t(crCopy.decision[recKey], lang)}
        </span>
      </div>

      {/* Description */}
      <p className="text-[10px] text-white/45 leading-relaxed line-clamp-2">
        {coa.description}
      </p>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-2">
        <MetricCell
          label={t(crCopy.decision.riskReduction, lang)}
          value={`${Math.round(coa.riskReduction * 100)}%`}
          color={coa.riskReduction >= 0.6 ? "text-emerald-400" : "text-blue-300"}
        />
        <MetricCell
          label={t(crCopy.decision.cost, lang)}
          value={coa.cost}
          color="text-white/70"
        />
        <MetricCell
          label={t(crCopy.decision.timeframe, lang)}
          value={coa.timeframe}
          color="text-white/70"
        />
      </div>

      {/* Confidence Bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[9px] text-white/35">
          <span>{t(crCopy.commandBar.confidence, lang)}</span>
          <span className="text-white/60">{Math.round(coa.confidence * 100)}%</span>
        </div>
        <div className="h-1 rounded-full bg-white/[0.06]">
          <div
            className="h-1 rounded-full bg-blue-400 transition-all"
            style={{ width: `${Math.min(coa.confidence * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Requirements */}
      {coa.requirements.length > 0 && (
        <div>
          <span className="text-[8px] uppercase tracking-wider text-white/25">
            {t(crCopy.decision.requirements, lang)}
          </span>
          <div className="mt-1 flex flex-wrap gap-1">
            {coa.requirements.slice(0, 3).map((r, i) => (
              <span
                key={i}
                className="rounded-full bg-white/[0.04] px-1.5 py-0.5 text-[8px] text-white/40"
              >
                {r}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Select Button */}
      <button
        className={`w-full rounded-lg py-1.5 text-[10px] font-medium transition-colors ${
          isSelected
            ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
            : "bg-white/[0.04] text-white/40 border border-white/[0.06] hover:bg-white/[0.06]"
        }`}
      >
        {isSelected
          ? t(crCopy.decision.selected, lang)
          : t(crCopy.decision.selectCOA, lang)}
      </button>
    </div>
  );
}

/* ── Metric Cell ── */

function MetricCell({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="rounded-lg bg-black/25 p-1.5 space-y-0.5">
      <p className="text-[8px] text-white/30 truncate">{label}</p>
      <p className={`text-[11px] font-semibold ${color}`}>{value}</p>
    </div>
  );
}
