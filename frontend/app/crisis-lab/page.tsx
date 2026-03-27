"use client";

import { GCCConflictPreset } from "@/components/scenario-packs/GCCConflictPreset";
import { GCCAirportMap } from "@/components/maps/GCCAirportMap";
import { AirportImpactPanel } from "@/components/control-room/AirportImpactPanel";
import { EnergyShockPanel } from "@/components/control-room/EnergyShockPanel";
import { ECommerceImpactPanel } from "@/components/control-room/ECommerceImpactPanel";
import { CrisisSummaryPanel } from "@/components/control-room/CrisisSummaryPanel";
import { StrategicGraphPanel } from "@/components/graph/StrategicGraphPanel";
import { PropagationTimeline } from "@/components/monitoring/PropagationTimeline";
import { MonitoringStrip } from "@/components/monitoring/MonitoringStrip";
import { MaritimeTradePanel } from "@/components/crisis/MaritimeTradePanel";
import { FinancialStressPanel } from "@/components/crisis/FinancialStressPanel";
import { SupplyChainPanel } from "@/components/crisis/SupplyChainPanel";
import { SocialResponsePanel } from "@/components/crisis/SocialResponsePanel";
import { ExecutiveActionBundlePanel } from "@/components/crisis/ExecutiveActionBundlePanel";

/* ── Decision Intelligence Panels ── */
import { ExecutiveNarrativePanel } from "@/components/crisis/ExecutiveNarrativePanel";
import { DecisionOptionsPanel } from "@/components/crisis/DecisionOptionsPanel";
import { CriticalNodesPanel } from "@/components/crisis/CriticalNodesPanel";
import { DecisionWindowPanel } from "@/components/crisis/DecisionWindowPanel";
import { ConfidenceBandPanel } from "@/components/crisis/ConfidenceBandPanel";

/* ── Hooks ── */
import { useCrisisLab } from "@/lib/hooks/useCrisisLab";
import { useDecisionIntelligence } from "@/lib/hooks/useDecisionIntelligence";

export default function CrisisLabPage() {
  const { assessment, loading, error, loadDefaultScenario } = useCrisisLab();
  const {
    bundle: diBundle,
    loading: diLoading,
    error: diError,
    loadDecisionIntelligence,
  } = useDecisionIntelligence();

  const handleLoad = async () => {
    await loadDefaultScenario();
    await loadDecisionIntelligence();
  };

  return (
    <div className="min-h-screen bg-[#06070B] text-white antialiased">
      <div className="mx-auto max-w-[1800px] px-6 py-8">
        {/* ── Header ── */}
        <div className="mb-6">
          <p className="text-xs uppercase tracking-[0.35em] text-blue-300">
            VIVO SIM — Crisis Lab
          </p>
          <h1 className="mt-3 text-4xl font-semibold">
            GCC Crisis Rehearsal Console
          </h1>
          <p className="mt-3 max-w-3xl text-white/60">
            Aviation, energy, logistics, maritime trade, financial markets, and
            social dynamics — stress-tested across GCC systems. Decision
            intelligence layer transforms impact data into executive-grade
            options.
          </p>
        </div>

        {/* ── Monitoring Strip ── */}
        <div className="mb-6">
          <MonitoringStrip assessment={assessment} />
        </div>

        {/* ── Error state ── */}
        {(error || diError) && (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
            {error || diError}
          </div>
        )}

        {/* ── 3-column layout ── */}
        <div className="grid grid-cols-12 gap-6">
          {/* Left Rail — Scenario + Summary */}
          <div className="col-span-12 space-y-6 xl:col-span-3">
            <GCCConflictPreset
              onLoad={handleLoad}
              isLoading={loading || diLoading}
            />
            <CrisisSummaryPanel assessment={assessment} />
            <ExecutiveActionBundlePanel
              executive={assessment?.executive_action_bundle}
            />
          </div>

          {/* Center — Map + Graph + Timeline */}
          <div className="col-span-12 space-y-6 xl:col-span-6">
            <GCCAirportMap airports={assessment?.airport_impacts ?? []} />
            <StrategicGraphPanel
              nodes={assessment?.node_impacts}
              propagation={assessment?.propagation}
            />
            <PropagationTimeline steps={assessment?.propagation ?? []} />
          </div>

          {/* Right Rail — Decision Intelligence First, then Impact Panels */}
          <div className="col-span-12 space-y-6 xl:col-span-3">
            {/* ── Decision Intelligence Layer ── */}
            <ExecutiveNarrativePanel
              narrative={diBundle?.executive_narrative}
            />
            <DecisionOptionsPanel
              options={diBundle?.decision_options}
            />
            <CriticalNodesPanel
              nodes={diBundle?.critical_nodes}
            />
            <DecisionWindowPanel
              windows={diBundle?.decision_windows}
            />
            <ConfidenceBandPanel
              bands={diBundle?.confidence_bands}
              overallConfidence={diBundle?.overall_confidence}
            />

            {/* ── Impact Panels ── */}
            <AirportImpactPanel
              airports={assessment?.airport_impacts ?? []}
            />
            <EnergyShockPanel energy={assessment?.energy_impact} />
            <MaritimeTradePanel
              maritime={assessment?.maritime_trade_impact}
            />
            <FinancialStressPanel
              finance={assessment?.financial_stress_impact}
            />
            <SupplyChainPanel supply={assessment?.supply_chain_impact} />
            <SocialResponsePanel
              social={assessment?.social_response_impact}
            />
            <ECommerceImpactPanel
              ecommerce={assessment?.ecommerce_impact}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
