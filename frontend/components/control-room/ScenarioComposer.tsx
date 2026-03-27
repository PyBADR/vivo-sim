"use client";

import { useState } from "react";

interface Props {
  onRun: (scenario: string) => Promise<void>;
  isRunning: boolean;
  defaultValue?: string;
  error?: string | null;
}

const EXAMPLE_SCENARIOS = [
  {
    label_en: "US–Iran Escalation",
    label_ar: "تصعيد أميركي–إيراني",
    text: "US–Iran military escalation triggers regional instability across the GCC, affecting oil supply chains, airspace operations across 9 major airports, logistics networks, and financial markets. Strait of Hormuz shipping routes face disruption risk, with cascading effects on refined fuel supply, aviation operations, and cross-border e-commerce fulfillment.",
  },
  {
    label_en: "GCC Airspace Disruption",
    label_ar: "تعطل المجال الجوي الخليجي",
    text: "Regional airspace restrictions force rerouting of commercial flights across GCC hubs including Dubai International, Hamad International Doha, and King Khalid International Riyadh. Fuel cost spikes, insurance premium increases, and airport congestion create cascading operational stress across aviation and cargo systems.",
  },
  {
    label_en: "Oil Facility Strike",
    label_ar: "ضربة منشأة نفطية",
    text: "A strike on a major oil storage or refining facility triggers immediate supply shock across GCC energy systems. Refined fuel availability drops, aviation fuel costs spike, trucking and logistics face delays, and consumer fuel prices surge with panic buying amplification through social media channels.",
  },
  {
    label_en: "Saudi Fuel Price Spike",
    label_ar: "ارتفاع أسعار الوقود",
    text: "ارتفاع مفاجئ في أسعار الوقود في السعودية يؤدي إلى ضغط إعلامي وشعبي على قطاعات النقل والطيران والتأمين، مع انتشار سريع عبر منصات التواصل الاجتماعي وتأثير مباشر على تكاليف التشغيل في المطارات الرئيسية.",
  },
  {
    label_en: "Subsea Cable Disruption",
    label_ar: "تعطل كابل بحري",
    text: "A subsea cable disruption near a GCC corridor triggers payment latency, public concern, and operational escalation across logistics, telecom, and insurance systems. Cross-border e-commerce fulfillment faces delays as financial transaction processing slows.",
  },
];

export function ScenarioComposer({
  onRun,
  isRunning,
  defaultValue = "",
  error,
}: Props) {
  const [value, setValue] = useState(defaultValue);

  return (
    <div className="rounded-2xl border border-blue-500/15 bg-gradient-to-b from-blue-500/[0.06] to-transparent p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.35em] text-blue-400/70">
            Scenario Composer
          </p>
          <h2 className="mt-1 text-xl font-semibold">
            Simulate What Happens Next
          </h2>
        </div>
        <button
          className="rounded-xl bg-blue-500 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-blue-400 hover:shadow-lg hover:shadow-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isRunning || !value.trim()}
          onClick={() => onRun(value)}
        >
          {isRunning ? (
            <span className="flex items-center gap-2">
              <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Running Pipeline…
            </span>
          ) : (
            "Run Control Room"
          )}
        </button>
      </div>

      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Enter a GCC or enterprise scenario in Arabic or English…"
        className="min-h-[120px] w-full resize-none rounded-xl border border-white/[0.06] bg-black/40 p-4 text-sm leading-relaxed text-white outline-none transition-colors placeholder:text-white/25 focus:border-blue-500/30"
        dir="auto"
      />

      {/* Quick scenarios */}
      <div className="mt-3 flex flex-wrap gap-2">
        {EXAMPLE_SCENARIOS.map((sc, i) => (
          <button
            key={i}
            onClick={() => setValue(sc.text)}
            className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 text-[11px] text-white/40 transition-colors hover:border-white/10 hover:text-white/60"
          >
            {sc.label_en.slice(0, 40)}{sc.label_en.length > 40 ? "…" : ""}
          </button>
        ))}
      </div>

      {error && (
        <div className="mt-3 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm text-red-300">
          {error}
        </div>
      )}
    </div>
  );
}
