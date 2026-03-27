"use client";

import { useState } from "react";

interface Props {
  onRun: (scenario: string) => Promise<void>;
  isRunning: boolean;
  defaultValue?: string;
  error?: string | null;
}

const EXAMPLE_SCENARIOS = [
  "A subsea cable disruption near a GCC corridor triggers payment latency, public concern, and operational escalation across logistics, telecom, and insurance systems.",
  "ارتفاع مفاجئ في أسعار الوقود في السعودية يؤدي إلى ضغط إعلامي وشعبي على قطاعات النقل والطيران والتأمين",
  "Unexpected regulatory tightening on drone operations in UAE airspace disrupts logistics supply chains and triggers insurance claims across aviation and cargo sectors.",
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
            onClick={() => setValue(sc)}
            className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 text-[11px] text-white/40 transition-colors hover:border-white/10 hover:text-white/60"
          >
            {sc.slice(0, 60)}…
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
