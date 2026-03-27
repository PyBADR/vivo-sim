"use client";

interface Props {
  onLoad: () => Promise<void>;
  isLoading?: boolean;
}

export function GCCConflictPreset({ onLoad, isLoading }: Props) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
      <p className="text-xs uppercase tracking-[0.3em] text-white/40">
        GCC Crisis Preset
      </p>

      <h3 className="mt-2 text-xl font-semibold text-white">
        US–Iran Escalation Impact on GCC
      </h3>

      <p className="mt-3 text-sm leading-6 text-white/65">
        Aviation, energy, trade, sentiment, and airport-system stress across the GCC.
      </p>

      <div className="mt-4 space-y-2 text-sm text-white/60">
        <div>• Airports: KWI, RUH, DMM, JED, DXB, AUH, DOH, BAH, MCT</div>
        <div>• Layers: aviation, fuel, trade, social, macro</div>
        <div>• Mode: Rehearsed Reality / Crisis Stress Test</div>
      </div>

      <button
        onClick={onLoad}
        disabled={isLoading}
        className="mt-5 rounded-2xl bg-blue-500 px-4 py-3 text-sm font-medium text-white transition hover:bg-blue-400 disabled:opacity-60"
      >
        {isLoading ? "Loading Scenario..." : "Load Crisis Scenario"}
      </button>
    </div>
  );
}
