"use client";

import { useControlRoomStore } from "@/lib/state/controlRoomStore";
import { crCopy } from "@/lib/config/control-room-copy";
import { t } from "@/lib/utils/i18n";
import type { CourseOfAction } from "@/lib/types/controlRoom";
import type { DecisionClarityResult, DecisionDriver, RecommendedAction, AffectedEntity, ExposedLine, ActionCategory } from "@/lib/decision/decisionClarity";
import type { InsuranceVisualizationResult } from "@/lib/insurance/insuranceVisualization";
import { URGENCY_CONFIG } from "@/lib/insurance/insuranceVisualization";
import type { CopyPair } from "@/lib/types/i18n";
import type { CommandSnapshot, TimeBand } from "@/lib/demo/commandSnapshot";
import type { FinancialImpactResult, LossCategory, ScenarioComparison } from "@/lib/finance/financialImpact";
import { formatUSD, formatLossRange } from "@/lib/finance/financialImpact";
import type { TrustLayerResult, ConfidenceBasisEntry } from "@/lib/trust/trustLayer";
import { getVisibility } from "@/lib/demo/executiveMode";

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
  underwriting: "\u25c6",
  claims: "\u25cf",
  fraud: "\u25b2",
  operations: "\u25a0",
};

/* ── Main Component ── */

export function RightDecisionRail() {
  const { state, dispatch } = useControlRoomStore();
  const { coursesOfAction, selectedCOAId, lang, diBundle, playback, decisionClarity, insuranceViz, commandSnapshot, financialImpact, trustLayer, viewMode } = state;

  const isPlaybackActive = playback.status !== "idle";
  const clarity = decisionClarity as DecisionClarityResult | null;
  const insViz = insuranceViz as InsuranceVisualizationResult | null;
  const snapshot = commandSnapshot as CommandSnapshot | null;
  const finance = financialImpact as FinancialImpactResult | null;
  const trust = trustLayer as TrustLayerResult | null;
  const vis = getVisibility(viewMode);

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

          {/* Section 2: Financial Impact */}
          {finance && <FinancialImpactSection finance={finance} lang={lang} vis={vis} />}

          {/* Section 3: Why This Decision Changed */}
          {vis.showAnalyticDriverDetail && (
            <DriversSection drivers={clarity.topDecisionDrivers} lang={lang} maxDrivers={vis.maxDrivers} />
          )}

          {/* Section 4: What To Do Now */}
          <ActionsSection actions={clarity.recommendedActions} lang={lang} maxActions={vis.maxActions} />

          {/* Section 5: Affected Entities */}
          <EntitiesSection entities={clarity.affectedEntities} lang={lang} maxEntities={vis.maxEntities} />

          {/* Section 6: Exposed Insurance Lines */}
          <ExposedLinesSection lines={clarity.topExposedLines} insViz={insViz} lang={lang} maxLines={vis.maxLines} />

          {/* Section 7: Trust & Model Basis */}
          {trust && <TrustSection trust={trust} lang={lang} vis={vis} />}

          {/* Section 8: Baseline vs Active */}
          {finance && <BaselineComparisonSection comparison={finance.scenarioComparison} lang={lang} />}

          {/* Section 9: Time to Impact (analyst view) */}
          {vis.showTimeBands && snapshot && snapshot.timeToImpact.length > 0 && (
            <TimeToImpactSection entries={snapshot.timeToImpact} lang={lang} />
          )}
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
   Section 2: Financial Impact
   ═══════════════════════════════════════════════ */

function FinancialImpactSection({
  finance,
  lang,
  vis,
}: {
  finance: FinancialImpactResult;
  lang: "en" | "ar";
  vis: ReturnType<typeof getVisibility>;
}) {
  return (
    <div className="rounded-xl border border-amber-500/15 bg-amber-500/[0.03] p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[8px] uppercase tracking-[0.2em] text-amber-400/60">
          {t(crCopy.finance.estimatedLoss, lang)}
        </span>
        <span className="text-[7px] text-white/25">{finance.timeWindow}</span>
      </div>

      {/* Total Loss Range — prominent */}
      <div className="text-center py-1">
        <p className="text-[18px] font-bold text-amber-400 font-mono tracking-tight">
          {formatLossRange(finance.totalEstimatedLossMin, finance.totalEstimatedLossMax)}
        </p>
        <p className="text-[7px] text-white/25 mt-0.5">
          {t(crCopy.finance.confidenceBand, lang)}: {finance.confidenceBand}
        </p>
      </div>

      {/* Category Breakdown */}
      <div className="space-y-1">
        {finance.lossBreakdown.slice(0, vis.maxLines).map((cat) => (
          <LossCategoryRow key={cat.categoryKey} cat={cat} lang={lang} />
        ))}
      </div>

      {/* Primary Driver */}
      <div className="flex items-center justify-between pt-1 border-t border-white/[0.04] text-[8px]">
        <span className="text-white/25">{t(crCopy.finance.primaryDriver, lang)}</span>
        <span className="text-white/50">{finance.primaryLossDriver}</span>
      </div>

      {/* Do-Nothing Cost */}
      <div className="flex items-center justify-between text-[8px]">
        <span className="text-amber-400/50">{t(crCopy.finance.doNothingCost, lang)}</span>
        <span className="text-amber-400 font-mono font-semibold">{formatUSD(finance.doNothingCost)}</span>
      </div>
    </div>
  );
}

function LossCategoryRow({ cat, lang }: { cat: LossCategory; lang: "en" | "ar" }) {
  const urgColor = URGENCY_LABEL_COLOR[cat.urgency] ?? "text-white/30 bg-white/5 border-white/10";
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1.5 min-w-0">
        <span className={`shrink-0 rounded border px-1 py-px text-[6px] font-bold tracking-wider ${urgColor}`}>
          {cat.urgency === "immediate" ? "IMM" : cat.urgency === "short_term" ? "ST" : "MT"}
        </span>
        <span className="text-[9px] text-white/55 truncate">{cat.category}</span>
      </div>
      <span className="text-[9px] font-mono text-white/45 shrink-0 ml-2">
        {formatLossRange(cat.minLoss, cat.maxLoss)}
      </span>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Section 3: Why This Decision Changed (Ranked Drivers)
   ═══════════════════════════════════════════════ */

function DriversSection({ drivers, lang, maxDrivers }: { drivers: DecisionDriver[]; lang: "en" | "ar"; maxDrivers: number }) {
  if (drivers.length === 0) return null;

  const maxContribution = Math.max(...drivers.map((d) => d.contribution), 1);

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-3 space-y-2">
      <span className="text-[8px] uppercase tracking-[0.2em] text-white/30">
        {lang === "ar" ? crCopy.decision.whyChanged.ar : crCopy.decision.whyChanged.en}
      </span>

      <div className="space-y-1.5">
        {drivers.slice(0, maxDrivers).map((driver, i) => (
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
   Section 4: What To Do Now (Grouped Actions)
   ═══════════════════════════════════════════════ */

function ActionsSection({ actions, lang, maxActions }: { actions: RecommendedAction[]; lang: "en" | "ar"; maxActions: number }) {
  if (actions.length === 0) return null;

  // Group by category
  const grouped = new Map<ActionCategory, RecommendedAction[]>();
  for (const action of actions.slice(0, maxActions)) {
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
   Section 5: Affected Entities
   ═══════════════════════════════════════════════ */

function EntitiesSection({ entities, lang, maxEntities }: { entities: AffectedEntity[]; lang: "en" | "ar"; maxEntities: number }) {
  if (entities.length === 0) return null;

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-3 space-y-2">
      <span className="text-[8px] uppercase tracking-[0.2em] text-white/30">
        {lang === "ar" ? crCopy.decision.affectedEntities.ar : crCopy.decision.affectedEntities.en}
      </span>

      <div className="space-y-1">
        {entities.slice(0, maxEntities).map((entity) => (
          <div key={entity.id} className="flex items-center gap-2">
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
                <span>\u00b7</span>
                <span>{entity.country}</span>
                <span>\u00b7</span>
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
   Section 6: Exposed Insurance Lines
   ═══════════════════════════════════════════════ */

function ExposedLinesSection({
  lines,
  insViz,
  lang,
  maxLines,
}: {
  lines: ExposedLine[];
  insViz: InsuranceVisualizationResult | null;
  lang: "en" | "ar";
  maxLines: number;
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
        {lines.slice(0, maxLines).map((line) => {
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
                <span>\u00b7</span>
                <span>Freq +{Math.round(line.frequencyUplift * 100)}%</span>
                {line.fraudUplift > 0.1 && (
                  <>
                    <span>\u00b7</span>
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
   Section 7: Trust & Model Basis
   ═══════════════════════════════════════════════ */

function TrustSection({
  trust,
  lang,
  vis,
}: {
  trust: TrustLayerResult;
  lang: "en" | "ar";
  vis: ReturnType<typeof getVisibility>;
}) {
  const scoreColor =
    trust.trustScore >= 65 ? "text-emerald-400"
    : trust.trustScore >= 40 ? "text-amber-400"
    : "text-red-400";

  const actionColor =
    trust.actionConfidence === "high" ? "text-emerald-400"
    : trust.actionConfidence === "moderate" ? "text-amber-400"
    : "text-red-400";

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-3 space-y-2">
      <span className="text-[8px] uppercase tracking-[0.2em] text-white/30">
        {t(crCopy.trust.modelBasis, lang)}
      </span>

      {/* Trust Score + Action Confidence */}
      <div className="grid grid-cols-2 gap-1.5">
        <div className="rounded-lg bg-black/25 p-1.5 space-y-0.5">
          <p className="text-[7px] text-white/30">{t(crCopy.trust.trustScore, lang)}</p>
          <p className={`text-[14px] font-bold font-mono ${scoreColor}`}>{trust.trustScore}</p>
        </div>
        <div className="rounded-lg bg-black/25 p-1.5 space-y-0.5">
          <p className="text-[7px] text-white/30">{t(crCopy.trust.actionConfidence, lang)}</p>
          <p className={`text-[11px] font-semibold ${actionColor}`}>
            {trust.actionConfidence.toUpperCase()}
          </p>
        </div>
      </div>

      {/* Quick stats */}
      <div className="flex items-center justify-between text-[8px]">
        <span className="text-white/25">{t(crCopy.trust.signals, lang)}</span>
        <span className="text-white/50 font-mono">{trust.confirmedSignals} ({trust.sourceCount} types)</span>
      </div>
      <div className="flex items-center justify-between text-[8px]">
        <span className="text-white/25">{t(crCopy.trust.activeNodes, lang)} / {t(crCopy.trust.activeEdges, lang)}</span>
        <span className="text-white/50 font-mono">{trust.activeNodesCount} / {trust.activeEdgesCount}</span>
      </div>

      {/* Confidence Basis Bullets */}
      <div className="space-y-1 pt-1 border-t border-white/[0.04]">
        {trust.confidenceBasis.slice(0, vis.maxDrivers).map((basis) => (
          <ConfidenceBasisRow key={basis.factor} basis={basis} lang={lang} />
        ))}
      </div>

      {/* Model Inputs (analyst only) */}
      {vis.showModelInputs && trust.modelInputsSummary.length > 0 && (
        <div className="space-y-0.5 pt-1 border-t border-white/[0.04]">
          <span className="text-[7px] uppercase tracking-wider text-white/20">
            {t(crCopy.trust.modelInputs, lang)}
          </span>
          {trust.modelInputsSummary.map((input) => (
            <div key={input.value} className="flex items-center justify-between text-[8px]">
              <span className="text-white/25">{lang === "ar" ? input.label.ar : input.label.en}</span>
              <span className="text-white/45 font-mono">{input.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Known Limitations (analyst only) */}
      {vis.showKnownLimitations && trust.knownLimitations.length > 0 && (
        <div className="space-y-0.5 pt-1 border-t border-white/[0.04]">
          <span className="text-[7px] uppercase tracking-wider text-white/20">
            {t(crCopy.trust.knownLimitations, lang)}
          </span>
          {trust.knownLimitations.map((lim, i) => (
            <p key={i} className={`text-[8px] leading-snug ${lim.severity === "high" ? "text-red-400/60" : lim.severity === "medium" ? "text-amber-400/50" : "text-white/30"}`}>
              {lang === "ar" ? lim.text.ar : lim.text.en}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

function ConfidenceBasisRow({ basis, lang }: { basis: ConfidenceBasisEntry; lang: "en" | "ar" }) {
  const strengthColor =
    basis.strength === "strong" ? "bg-emerald-400"
    : basis.strength === "moderate" ? "bg-amber-400"
    : "bg-red-400";

  return (
    <div className="flex items-start gap-1.5">
      <div className={`h-1.5 w-1.5 rounded-full shrink-0 mt-1 ${strengthColor}`} />
      <p className="text-[8px] text-white/40 leading-snug">
        {lang === "ar" ? basis.description.ar : basis.description.en}
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Section 8: Baseline vs Active Comparison
   ═══════════════════════════════════════════════ */

function BaselineComparisonSection({ comparison, lang }: { comparison: ScenarioComparison; lang: "en" | "ar" }) {
  const decisionStateLabel = (state: string) => {
    const key = state as keyof typeof crCopy.decisionStates;
    const copy = crCopy.decisionStates[key] as CopyPair | undefined;
    return copy ? t(copy, lang) : state;
  };

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-3 space-y-2">
      <span className="text-[8px] uppercase tracking-[0.2em] text-white/30">
        {t(crCopy.finance.baselineVsActive, lang)}
      </span>

      <div className="space-y-1.5">
        <ComparisonRow
          label={t(crCopy.finance.risk, lang)}
          baseline={`${comparison.baselineRisk}%`}
          active={`${comparison.activeRisk}%`}
          delta={`+${comparison.riskDelta}%`}
          isAlert={comparison.riskDelta > 20}
        />
        <ComparisonRow
          label={t(crCopy.finance.loss, lang)}
          baseline={formatUSD(comparison.baselineLoss)}
          active={formatLossRange(comparison.activeLossMin, comparison.activeLossMax)}
          delta={`+${formatUSD(comparison.lossDelta)}`}
          isAlert={comparison.lossDelta > 500000}
        />
        <ComparisonRow
          label={t(crCopy.decision.decisionState, lang)}
          baseline={decisionStateLabel(comparison.baselineDecision)}
          active={decisionStateLabel(comparison.activeDecision)}
          delta="\u2192"
          isAlert={comparison.activeDecision !== "hold"}
        />
      </div>
    </div>
  );
}

function ComparisonRow({
  label,
  baseline,
  active,
  delta,
  isAlert,
}: {
  label: string;
  baseline: string;
  active: string;
  delta: string;
  isAlert: boolean;
}) {
  return (
    <div className="flex items-center justify-between text-[8px]">
      <span className="text-white/25 shrink-0 w-14">{label}</span>
      <span className="text-white/35 font-mono">{baseline}</span>
      <span className="text-white/20">\u2192</span>
      <span className={`font-mono font-medium ${isAlert ? "text-amber-400" : "text-white/55"}`}>{active}</span>
      <span className={`font-mono text-[7px] ${isAlert ? "text-red-400" : "text-white/30"}`}>{delta}</span>
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
   Section 9: Time to Impact
   ═══════════════════════════════════════════════ */

const TIME_BAND_COLOR: Record<TimeBand, string> = {
  immediate: "text-red-400 border-red-500/20",
  plus_12h: "text-amber-400 border-amber-500/20",
  plus_24_48h: "text-blue-400 border-blue-500/20",
  medium_horizon: "text-white/40 border-white/[0.08]",
};

function TimeToImpactSection({ entries, lang }: { entries: CommandSnapshot["timeToImpact"]; lang: "en" | "ar" }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-3 space-y-1.5">
      <span className="text-[8px] uppercase tracking-[0.2em] text-white/30">
        {lang === "ar" ? "\u062a\u0648\u0642\u064a\u062a \u0627\u0644\u0623\u062b\u0631" : "Time to Impact"}
      </span>
      {entries.map((entry) => {
        const bandClass = TIME_BAND_COLOR[entry.band] ?? TIME_BAND_COLOR.medium_horizon;
        return (
          <div key={entry.band} className={`rounded-lg border p-1.5 ${bandClass.split(" ")[1]} bg-white/[0.01]`}>
            <div className="flex items-center justify-between">
              <span className={`text-[8px] font-bold ${bandClass.split(" ")[0]}`}>
                {lang === "ar" ? entry.label.ar : entry.label.en}
              </span>
              {entry.sectors.length > 0 && (
                <span className="text-[7px] text-white/25">
                  {entry.sectors.slice(0, 2).join(", ")}
                </span>
              )}
            </div>
            <p className="text-[8px] text-white/35 leading-snug mt-0.5">
              {lang === "ar" ? entry.consequence.ar : entry.consequence.en}
            </p>
          </div>
        );
      })}
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
