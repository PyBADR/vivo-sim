"use client";

import { useState, useEffect } from "react";
import { useControlRoom } from "@/lib/hooks/useControlRoom";
import { ScenarioComposer } from "./ScenarioComposer";
import { SituationFeed } from "./SituationFeed";
import { WorldStatePanel } from "./WorldStatePanel";
import { TimelinePanel } from "./TimelinePanel";
import { BranchPanel } from "./BranchPanel";
import { DecisionPanel } from "./DecisionPanel";
import { InterventionPanel } from "./InterventionPanel";
import { IntelligenceBriefPanel } from "./IntelligenceBriefPanel";
import { AnalystPanel } from "./AnalystPanel";
import { AirportImpactPanel } from "./AirportImpactPanel";
import { EnergyShockPanel } from "./EnergyShockPanel";
import { ECommerceImpactPanel } from "./ECommerceImpactPanel";
import { CrisisPresetSelector } from "./CrisisPresetSelector";
import { StatusRail } from "./StatusRail";
import { MetricStrip } from "./MetricStrip";

export function ControlRoomShell() {
  const { state, runPipeline, topConfidence, completedStages } =
    useControlRoom();
  const [crisisAssessment, setCrisisAssessment] = useState<any>(null);

  // Fetch crisis assessment after pipeline completes
  useEffect(() => {
    if (completedStages > 0 && completedStages === state.statuses.length) {
      fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/scenarios/crisis/packs/us-iran-gcc/assessment`
      )
        .then((res) => res.json())
        .then((data) => setCrisisAssessment(data))
        .catch(() => {
          // Silent fail
        });
    }
  }, [completedStages, state.statuses.length]);

  return (
    <div className="min-h-screen bg-[#060a14] text-white antialiased">
      <div className="mx-auto max-w-[1800px] px-4 py-5 lg:px-6">
        {/* ── Header ────────────────────────────────── */}
        <header className="mb-5 flex items-center justify-between rounded-2xl border border-white/[0.06] bg-white/[0.02] px-6 py-4 backdrop-blur-sm">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.35em] text-blue-400/80">
              VIVO SIM — Control Room
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
              Scenario Intelligence Console
            </h1>
          </div>
          <div className="flex items-center gap-6 text-xs text-white/50">
            <span>
              Stages:{" "}
              <span className="text-white">
                {completedStages}/{state.statuses.length}
              </span>
            </span>
            <span>
              Confidence:{" "}
              <span className="text-white">
                {topConfidence != null
                  ? `${Math.round(topConfidence * 100)}%`
                  : "—"}
              </span>
            </span>
            <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-blue-300">
              Rehearsed Reality
            </span>
          </div>
        </header>

        {/* ── Scenario Composer ─────────────────────── */}
        <div className="mb-5 space-y-4">
          <ScenarioComposer
            onRun={runPipeline}
            isRunning={state.isRunning}
            defaultValue={state.scenarioInput}
            error={state.error}
          />
          <CrisisPresetSelector onSelectPreset={runPipeline} />
        </div>

        {/* ── 3-column layout ──────────────────────── */}
        <div className="grid grid-cols-12 gap-4">
          {/* Left Rail */}
          <aside className="col-span-12 space-y-4 lg:col-span-3">
            <StatusRail statuses={state.statuses} />
            <SituationFeed
              normalize={state.normalize}
              signals={state.signals}
            />
          </aside>

          {/* Center Canvas */}
          <main className="col-span-12 space-y-4 lg:col-span-6">
            <WorldStatePanel
              graph={state.enrichment ?? state.graph}
              selectedBranchId={state.selectedBranchId}
            />
            <TimelinePanel simulation={state.simulation} />
            <BranchPanel
              simulation={state.simulation}
              selectedBranchId={state.selectedBranchId}
            />
          </main>

          {/* Right Rail */}
          <aside className="col-span-12 space-y-4 lg:col-span-3">
            <DecisionPanel decision={state.decision} />
            <InterventionPanel
              simulation={state.simulation}
              selectedInterventionId={state.selectedInterventionId}
            />
            <IntelligenceBriefPanel brief={state.brief} />
            <AnalystPanel analysis={state.analysis} />
            <AirportImpactPanel airports={crisisAssessment?.airport_impacts ?? []} />
            <EnergyShockPanel energy={crisisAssessment?.energy_impact} />
            <ECommerceImpactPanel ecommerce={crisisAssessment?.ecommerce_impact} />
          </aside>
        </div>

        {/* ── Bottom strip ─────────────────────────── */}
        <div className="mt-5">
          <MetricStrip
            simulation={state.simulation}
            decision={state.decision}
          />
        </div>
      </div>
    </div>
  );
}
