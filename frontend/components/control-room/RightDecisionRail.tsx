"use client";

import { useControlRoomStore } from "@/lib/state/controlRoomStore";
import { crCopy } from "@/lib/config/control-room-copy";
import { t } from "@/lib/utils/i18n";
import type { CourseOfAction } from "@/lib/types/controlRoom";
import type { DecisionClarityResult, DecisionDriver, RecommendedAction, AffectedEntity, ExposedLine, ActionCategory } from "@/lib/decision/decisionClarity";
import type { InsuranceVisualizationResult } from "@/lib/insurance/insuranceVisualization";
import { URGENCY_CONFIG } from "@/lib/insurance/insuranceVisualization";
import type { CopyPair } from "@/lib/types/i18n";

/* ── Decision State Visual Config ── */

const DECISION_STATE_CONFIG: Record<string, {
  color: string;
  bg: string;
  border: string;
  glow: string;
}> = {
  hold: { color: "text-white/40", bg: "bg-white/[0.03]", border: "border-white/[0.08]", glow: "" },
  escalate: { color: "text-yellow-400", bg: "bg-yellow-500/[0.06]", border: "border-yellow-500/20", glow: "shadow-[0_0_12px_rgba(234,179,8,0.15)]" },
  activate_response: { color: "text-amber-400", bg: "bg-amber-500/[0.08]", border: "border-amber-500/25", glow: "shadow-[0_0_16px_rgba(245,158,11,0.2)]" },
  emergency_protocol: { color: "text-red-400", bg: "bg-red-500/[0.08]", border: "border-red-500/25", glow: "shadow-[0_0_20px_rgba(239,68,68,0.25)]" },
};

const URGENCY_LABEL_COLOR: Record<string, string> = {
  immediate: "text-red-400 bg-red-500/10 border-red-500/20",
  short_term: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  medium_term: "text-blue-400 bg-blue-500/10 border-blue-500/20",
};

const CATEGORY_ICON: Record<ActionCategory, string> = {
  underwriting: "◆",
  claims: "●",
  fraud: "▲",
  operations: "■",
};

/* ── Main Component ── */

export function RightDecisionRail() {
  const { state, dispatch } = useControlRoomStore();
  const { coursesOfAction, selectedCOAId, lang, diBundle, playback, decisionClarity, insuranceViz } = state;

  const isPlaybackActive = playback.status !== "idle";
  const clarity = decisionClarity as DecisionClarityResult | null;
  const insViz = insuranceViz as InsuranceVisualizationResult | null;

  return (
    <aside
      className="flex flex-col gap-2 overflow-y-auto border-l border-white/[0.06] bg-[#080c18]/60 p-3"
      style={{ gridArea: "right" }}
    >
      {/* ── Section Title ── */}
      <div className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/30">
        {t(crCopy.decision.title, lang)}
      </div>

      {/* ── During Playback: Decision Cockpit ── */}
      {isPlaybackActive && clarity ? (
        <>
          {/* Section 1: Decision Status */}
          <DecisionStatusSection clarity={clarity} playback={playback} lang={lang} />

          {/* Section 2: Why This Decision Changed */}
          <DriversSection drivers={clarity.topDecisionDrivers} lang={lang} />

          {/* Section 3: What To Do Now */}
          <ActionsSection actions={clarity.recommendedActions} lang={lang} />

          {/* Section 4: Affected Entities */}
          <EntitiesSection entities={clarity.affectedEntities} lang={lang} />

          {/* Section 5: Exposed Insurance Lines */}
          <ExposedLinesSection lines={clarity.topExposedLines} insViz={insViz} lang={lang} />
        </>
      ) : (
        <>
          {/* ── Static Mode: Confidence + COAs ── */}
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
        </>
      )}
    </aside>
  );
}

/* ═══════════════════════════════════════════════
   Section 1: Decision Status
   ═══════════════════════════════════════════════ */

function DecisionStatusSection({
  clarity,
  playback,
  lang,
}: {
  clarity: DecisionClarityResult;
  playback: { maxImpact: number; insurancePressure: number; affectedCount: number; currentDecision: string };
  lang: "en" | "ar";
}) {
  const config = DECISION_STATE_CONFIG[playback.currentDecision] ?? DECISION_STATE_CONFIG.hold;
  const stateKey = playback.currentDecision as keyof typeof crCopy.decisionStates;
  const stateLabel = crCopy.decisionStates[stateKey];

  return (
    <div className={`rounded-xl border p-3 space-y-2 transition-all ${config.bg} ${config.border} ${config.glow}`}>
      {/* State Badge */}
      <div className="flex items-center justify-between">
        <span className="text-[8px] uppercase tracking-[0.2em] text-white/30">
          {t(crCopy.decision.decisionState, lang)}
        </span>
        <span className={`text-[11px] font-bold tracking-wider ${config.color}`}>
          {stateLabel ? t(stateLabel, lang) : playback.currentDecision.replace("_", " ").toUpperCase()}
        </span>
      </div>

      {/* Executive Interpretation */}
      <p className="text-[10px] text-white/60 leading-relaxed">
        {lang === "ar" ? clarity.executiveInterpretation.ar : clarity.executiveInterpretation.en}
      </p>

      {/* Compact Gauges */}
      <div className="grid grid-cols-3 gap-1.5">
        <GaugeCell
          label={t(crCopy.decision.peakImpact, lang)}
          value={playback.maxImpact}
          color={playback.maxImpact >= 0.7 ? "#f87171" : playback.maxImpact >= 0.4 ? "#fbbf24" : "#60a5fa"}
        />
        <GaugeCell
          label={t(crCopy.decision.insurancePressure, lang)}
          value={playback.insurancePressure}
          color={playback.insurancePressure >= 0.6 ? "#f87171" : playback.insurancePressure >= 0.3 ? "#fbbf24" : "#60a5fa"}
        />
        <div className="rounded-lg bg-black/25 p-1.5 space-y-0.5">
          <p className="text-[7px] text-white/30 truncate">{t(crCopy.decision.affectedNodes, lang)}</p>
          <p className="text-[12px] font-semibold text-white/70">{playback.affectedCount}</p>
        </div>
      </div>

      {/* Financial + Deadline */}
      <div className="flex items-center justify-between pt-1 border-t border-white/[0.04] text-[8px]">
        <span className="text-white/25">{t(crCopy.decision.financialImpact, lang)}</span>
        <span className="text-white/50 font-mono">{clarity.financialImpact}</span>
      </div>
      <div className="flex items-center justify-between text-[8px]">
        <span className="text-white/25">{t(crCopy.decision.deadline, lang)}</span>
        <span className="text-white/50 font-mono">{clarity.decisionDeadline}</span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Section 2: Why This Decision Changed (Ranked Drivers)
   ═══════════════════════════════════════════════ */

function DriversSection({ drivers, lang }: { drivers: DecisionDriver[]; lang: "en" | "ar" }) {
  if (drivers.length === 0) return null;

  const maxContribution = Math.max(...drivers.map((d) => d.contribution), 1);

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-3 space-y-2">
      <span className="text-[8px] uppercase tracking-[0.2em] text-white/30">
        {lang === "ar" ? crCopy.decision.whyChanged.ar : crCopy.decision.whyChanged.en}
      </span>

      <div className="space-y-1.5">
        {drivers.slice(0, 4).map((driver, i) => (
          <div key={driver.id} className="space-y-0.5">
            <div className="flex items-start gap-1.5">
              <span className="text-[9px] font-mono text-white/20 mt-px">{i + 1}.</span>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-white/70 leading-snug truncate">
                  {lang === "ar" ? driver.label.ar : driver.label.en}
                </p>
                <p className="text-[8px] text-white/30 leading-snug truncate">
                  {lang === "ar" ? driver.detail.ar : driver.detail.en}
                </p>
              </div>
              <span className="text-[9px] font-mono text-white/40 shrink-0">{driver.contribution}%</span>
            </div>
            <div className="ml-4 h-0.5 rounded-full bg-white/[0.04]">
              <div
                className="h-0.5 rounded-full bg-blue-400/60 transition-all"
                style={{ width: `${(driver.contribution / maxContribution) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Section 3: What To Do Now (Grouped Actions)
   ═══════════════════════════════════════════════ */

function ActionsSection({ actions, lang }: { actions: RecommendedAction[]; lang: "en" | "ar" }) {
  if (actions.length === 0) return null;

  // Group by category
  const grouped = new Map<ActionCategory, RecommendedAction[]>();
  for (const action of actions) {
    const existing = grouped.get(action.category) ?? [];
    existing.push(action);
    grouped.set(action.category, existing);
  }

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-3 space-y-2">
      <span className="text-[8px] uppercase tracking-[0.2em] text-white/30">
        {lang === "ar" ? crCopy.decision.whatToDoNow.ar : crCopy.decision.whatToDoNow.en}
      </span>

      <div className="space-y-2">
        {Array.from(grouped.entries()).map(([category, catActions]) => {
          const catCopy = crCopy.actionCategories[category] as CopyPair | undefined;
          return (
            <div key={category} className="space-y-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[8px] text-white/25">{CATEGORY_ICON[category]}</span>
                <span className="text-[8px] uppercase tracking-wider text-white/35 font-medium">
                  {catCopy ? t(catCopy, lang) : category}
                </span>
              </div>
              {catActions.slice(0, 2).map((action) => {
                const urgencyKey = action.urgency as keyof typeof crCopy.urgencyLabels;
                const urgencyCopy = crCopy.urgencyLabels[urgencyKey] as CopyPair | undefined;
                return (
                  <div key={action.id} className="flex items-start gap-1.5 ml-3">
                    <span className={`shrink-0 mt-0.5 rounded border px-1 py-px text-[6px] font-bold tracking-wider ${URGENCY_LABEL_COLOR[action.urgency] ?? "text-white/30 bg-white/5 border-white/10"}`}>
                      {urgencyCopy ? t(urgencyCopy, lang) : action.urgency}
                    </span>
                    <p className="text-[9px] text-white/55 leading-snug line-clamp-2">
                      {action.action}
                    </p>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Section 4: Affected Entities
   ═══════════════════════════════════════════════ */

function EntitiesSection({ entities, lang }: { entities: AffectedEntity[]; lang: "en" | "ar" }) {
  if (entities.length === 0) return null;

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-3 space-y-2">
      <span className="text-[8px] uppercase tracking-[0.2em] text-white/30">
        {lang === "ar" ? crCopy.decision.affectedEntities.ar : crCopy.decision.affectedEntities.en}
      </span>

      <div className="space-y-1">
        {entities.slice(0, 5).map((entity) => (
          <div key={entity.id} className="flex items-center gap-2">
            {/* Impact dot */}
            <div
              className="h-1.5 w-1.5 rounded-full shrink-0"
              style={{
                backgroundColor: entity.impact >= 0.7 ? "#f87171" : entity.impact >= 0.4 ? "#fbbf24" : "#60a5fa",
              }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-white/65 truncate">{entity.label}</span>
                <span className="text-[8px] font-mono text-white/35 shrink-0 ml-1">
                  {Math.round(entity.impact * 100)}%
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[7px] text-white/25">
                <span>{entity.sector}</span>
                <span>·</span>
                <span>{entity.country}</span>
                <span>·</span>
                <span className="italic">{entity.role}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Section 5: Exposed Insurance Lines
   ═══════════════════════════════════════════════ */

function ExposedLinesSection({
  lines,
  insViz,
  lang,
}: {
  lines: ExposedLine[];
  insViz: InsuranceVisualizationResult | null;
  lang: "en" | "ar";
}) {
  if (lines.length === 0) return null;

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-3 space-y-2">
      <span className="text-[8px] uppercase tracking-[0.2em] text-white/30">
        {lang === "ar" ? crCopy.decision.exposedLines.ar : crCopy.decision.exposedLines.en}
      </span>

      {/* Insurance Posture Summary */}
      {insViz && (
        <div className="grid grid-cols-2 gap-1.5 pb-1.5 border-b border-white/[0.04]">
          <PostureCell
            label={t(crCopy.decision.uwPosture, lang)}
            value={insViz.underwritingState}
            lang={lang}
          />
          <PostureCell
            label={t(crCopy.decision.claimsPosture, lang)}
            value={insViz.claimsState}
            lang={lang}
          />
        </div>
      )}

      {/* Line Cards */}
      <div className="space-y-1">
        {lines.slice(0, 4).map((line) => {
          const urgConfig = URGENCY_CONFIG[line.urgency] ?? URGENCY_CONFIG.stable;
          return (
            <div key={line.line} className={`rounded-lg border p-2 ${urgConfig.bgClass} ${urgConfig.borderClass}`}>
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-medium ${urgConfig.textClass}`}>
                  {lang === "ar" ? line.displayName.ar : line.displayName.en}
                </span>
                <span className={`text-[10px] font-mono font-semibold ${urgConfig.textClass}`}>
                  {line.exposureScore}%
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5 text-[7px] text-white/30">
                <span>Sev +{Math.round(line.severityUplift * 100)}%</span>
                <span>·</span>
                <span>Freq +{Math.round(line.frequencyUplift * 100)}%</span>
                {line.fraudUplift > 0.1 && (
                  <>
                    <span>·</span>
                    <span className="text-red-400/60">Fraud +{Math.round(line.fraudUplift * 100)}%</span>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Portfolio / Fraud Summary */}
      {insViz && (
        <div className="flex items-center justify-between pt-1 border-t border-white/[0.04]">
          <div className="text-[8px]">
            <span className="text-white/25">{t(crCopy.decision.portfolioPressure, lang)}: </span>
            <span className={insViz.portfolioPressure >= 0.5 ? "text-amber-400" : "text-white/50"}>
              {Math.round(insViz.portfolioPressure * 100)}%
            </span>
          </div>
          <div className="text-[8px]">
            <span className="text-white/25">{t(crCopy.decision.fraudRisk, lang)}: </span>
            <span className={insViz.fraudPressure >= 0.4 ? "text-red-400" : "text-white/50"}>
              {Math.round(insViz.fraudPressure * 100)}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Shared Sub-Components
   ═══════════════════════════════════════════════ */

function GaugeCell({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-lg bg-black/25 p-1.5 space-y-0.5">
      <p className="text-[7px] text-white/30 truncate">{label}</p>
      <p className="text-[12px] font-semibold" style={{ color }}>{Math.round(value * 100)}%</p>
      <div className="h-0.5 rounded-full bg-white/[0.06]">
        <div
          className="h-0.5 rounded-full transition-all duration-200"
          style={{ width: `${Math.min(value * 100, 100)}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function PostureCell({ label, value, lang }: { label: string; value: string; lang: "en" | "ar" }) {
  const postureKey = value as keyof typeof crCopy.postures;
  const postureCopy = crCopy.postures[postureKey] as CopyPair | undefined;
  const isAlert = ["restrict", "cease", "surge_prepare", "emergency"].includes(value);

  return (
    <div className="rounded-lg bg-black/25 p-1.5">
      <p className="text-[7px] text-white/25">{label}</p>
      <p className={`text-[9px] font-semibold ${isAlert ? "text-amber-400" : "text-white/50"}`}>
        {postureCopy ? t(postureCopy, lang) : value}
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   COA Card (Static mode — preserved from original)
   ═══════════════════════════════════════════════ */

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
      className={`rounded-xl border p-3 space-y-2 transition-all cursor-pointer ${
        isSelected
          ? "border-blue-500/30 bg-blue-500/[0.06]"
          : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]"
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[12px] font-medium text-white/90 leading-snug flex-1">
          {coa.title}
        </p>
        <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider ${recStyle}`}>
          {t(crCopy.decision[recKey], lang)}
        </span>
      </div>

      <p className="text-[10px] text-white/45 leading-relaxed line-clamp-2">
        {coa.description}
      </p>

      <div className="grid grid-cols-3 gap-2">
        <MetricCell label={t(crCopy.decision.riskReduction, lang)} value={`${Math.round(coa.riskReduction * 100)}%`} color={coa.riskReduction >= 0.6 ? "text-emerald-400" : "text-blue-300"} />
        <MetricCell label={t(crCopy.decision.cost, lang)} value={coa.cost} color="text-white/70" />
        <MetricCell label={t(crCopy.decision.timeframe, lang)} value={coa.timeframe} color="text-white/70" />
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between text-[9px] text-white/35">
          <span>{t(crCopy.commandBar.confidence, lang)}</span>
          <span className="text-white/60">{Math.round(coa.confidence * 100)}%</span>
        </div>
        <div className="h-1 rounded-full bg-white/[0.06]">
          <div className="h-1 rounded-full bg-blue-400 transition-all" style={{ width: `${Math.min(coa.confidence * 100, 100)}%` }} />
        </div>
      </div>

      <button
        className={`w-full rounded-lg py-1.5 text-[10px] font-medium transition-colors ${
          isSelected
            ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
            : "bg-white/[0.04] text-white/40 border border-white/[0.06] hover:bg-white/[0.06]"
        }`}
      >
        {isSelected ? t(crCopy.decision.selected, lang) : t(crCopy.decision.selectCOA, lang)}
      </button>
    </div>
  );
}

function MetricCell({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-lg bg-black/25 p-1.5 space-y-0.5">
      <p className="text-[8px] text-white/30 truncate">{label}</p>
      <p className={`text-[11px] font-semibold ${color}`}>{value}</p>
    </div>
  );
}
