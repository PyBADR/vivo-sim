import type { EnergyImpact } from "@/lib/types/crisis";

export function EnergyShockPanel({ energy }: { energy?: EnergyImpact | null }) {
  if (!energy) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        <p className="text-sm text-white/50">No energy impact data available.</p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
      <p className="text-xs uppercase tracking-[0.3em] text-white/40">
        Energy Shock
      </p>
      <h3 className="mt-2 text-xl font-semibold text-white">
        Oil & Fuel Transmission
      </h3>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-black/25 p-4">
          <p className="text-xs text-white/45">Oil Shock</p>
          <p className="mt-2 text-2xl font-semibold text-white">
            {energy.oil_shock.toFixed(2)}
          </p>
        </div>
        <div className="rounded-2xl bg-black/25 p-4">
          <p className="text-xs text-white/45">Refining Stress</p>
          <p className="mt-2 text-2xl font-semibold text-white">
            {energy.refining_stress.toFixed(2)}
          </p>
        </div>
        <div className="rounded-2xl bg-black/25 p-4">
          <p className="text-xs text-white/45">Logistics Delay</p>
          <p className="mt-2 text-2xl font-semibold text-white">
            {energy.logistics_delay.toFixed(2)}
          </p>
        </div>
        <div className="rounded-2xl bg-blue-500/10 p-4">
          <p className="text-xs text-white/45">Fuel Impact Score</p>
          <p className="mt-2 text-2xl font-semibold text-blue-300">
            {energy.fuel_impact_score.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
}
