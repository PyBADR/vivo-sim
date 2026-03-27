"use client";

import { useState } from "react";

/* ── Scenario + Map + Graph ── */
import { GCCConflictPreset } from "@/components/scenario-packs/GCCConflictPreset";
import { GCCAirportMap } from "@/components/maps/GCCAirportMap";
import { StrategicGraphPanel } from "@/components/graph/StrategicGraphPanel";
import { PropagationTimeline } from "@/components/monitoring/PropagationTimeline";
import { MonitoringStrip } from "@/components/monitoring/MonitoringStrip";

/* ── Decision Intelligence Panels ── */
import { ExecutiveBriefPanel } from "@/components/decision/ExecutiveBriefPanel";
import { DecisionPanel } from "@/components/decision/DecisionPanel";
import { CriticalNodesPanel } from "@/components/decision/CriticalNodesPanel";
import { DecisionWindowPanel } from "@/components/decision/DecisionWindowPanel";
import { ConfidencePanel } from "@/components/decision/ConfidencePanel";

/* ── Impact Panels (upgraded bilingual) ── */
import { AirportImpactPanel } from "@/components/crisis/AirportImpactPanel";
import { EnergyShockPanel } from "@/components/crisis/EnergyShockPanel";
import { MaritimeTradePanel } from "@/components/crisis/MaritimeTradePanel";
import { FinancialStressPanel } from "@/components/crisis/FinancialStressPanel";
import { SupplyChainPanel } from "@/components/crisis/SupplyChainPanel";
import { SocialResponsePanel } from "@/components/crisis/SocialResponsePanel";
import { ECommerceImpactPanel } from "@/components/control-room/ECommerceImpactPanel";

/* ── Legacy crisis panels (kept for summary + action bundle) ── */
import { CrisisSummaryPanel } from "@/components/control-room/CrisisSummaryPanel";
import { ExecutiveActionBundlePanel } from "@/components/crisis/ExecutiveActionBundlePanel";

/* ── Hooks ── */
import { useCrisisLab } from "@/lib/hooks/useCrisisLab";
import { useDecisionIntelligence } from "@/lib/hooks/useDecisionIntelligence";

/* ── i18n ── */
import { decisionCopy } from "@/lib/config/decision-copy";
import { t } from "@/lib/utils/i18n";
import type { Lang } from "@/lib/types/i18n";

export default function CrisisLabPage() {
  const { assessment, loading, error, loadDefaultScenario } = useCrisisLab();
  const {
    bundle: diBundle,
    loading: diLoading,
    error: diError,
    loadDecisionIntelligence,
  } = useDecisionIntelligence();

  const [lang, setLang] = useState<Lang>("en");

  const handleLoad = async () => {
    await loadDefaultScenario();
    await loadDecisionIntelligence();
  };

  const toggleLang = () => setLang((prev) => (prev === "en" ? "ar" : "en"));

  return (
    <div className="min-h-screen bg-[#06070B] text-white antialiased" dir={lang === "ar" ? "rtl" : "ltr"}>
      <div className="mx-auto max-w-[1800px] px-6 py-8">
        {/* ── Header ── */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-blue-300">
              VIVO SIM — Decision Intelligence
            </p>
            <h1 className="mt-3 text-4xl font-semibold">
              {lang === "en" ? "GCC Crisis Decision Console" : "منصة قرارات أزمات الخليج"}
            </h1>
            <p className="mt-3 max-w-3xl text-white/60">
              {lang === "en"
                ? "Aviation, energy, logistics, maritime trade, financial markets, and social dynamics — stress-tested across GCC systems. Decision intelligence layer transforms impact data into executive-grade options."
                : "الطيران والطاقة والخدمات اللوجستية والتجارة البحرية والأسواق المالية والديناميكيات الاجتماعية — اختبارات ضغط عبر أنظمة الخليج. طبقة ذكاء القرار تحول بيانات الأثر إلى خيارات بمستوى تنفيذي."}
            </p>
          </div>
          <button
            onClick={toggleLang}
            className="shrink-0 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs text-white/60 hover:bg-white/[0.06] transition-colors"
          >
            {lang === "en" ? "العربية" : "English"}
          </button>
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
          {/* Left Rail — Scenario + Summary + Executive Action */}
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
            <ExecutiveBriefPanel
              narrative={diBundle?.executive_narrative}
              assessment={assessment}
              lang={lang}
            />
            <DecisionPanel
              options={diBundle?.decision_options}
              rankedActions={assessment?.ranked_actions}
              lang={lang}
            />
            <CriticalNodesPanel
              criticalNodes={diBundle?.critical_nodes}
              nodeImpacts={assessment?.node_impacts}
              lang={lang}
            />
            <DecisionWindowPanel
              windows={diBundle?.decision_windows}
              propagation={assessment?.propagation}
              lang={lang}
            />
            <ConfidencePanel
              bands={diBundle?.confidence_bands}
              overallConfidence={diBundle?.overall_confidence}
              lang={lang}
            />

            {/* ── Impact Panels (bilingual, decision-oriented) ── */}
            <AirportImpactPanel
              airports={assessment?.airport_impacts ?? []}
              lang={lang}
            />
            <EnergyShockPanel energy={assessment?.energy_impact} lang={lang} />
            <MaritimeTradePanel
              maritime={assessment?.maritime_trade_impact}
              lang={lang}
            />
            <FinancialStressPanel
              finance={assessment?.financial_stress_impact}
              lang={lang}
            />
            <SupplyChainPanel supply={assessment?.supply_chain_impact} lang={lang} />
            <SocialResponsePanel
              social={assessment?.social_response_impact}
              lang={lang}
            />
            <ECommerceImpactPanel
              ecommerce={assessment?.ecommerce_impact}
              lang={lang}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
