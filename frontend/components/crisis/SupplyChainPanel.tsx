import type { SupplyChainImpact } from "@/lib/types/crisis";

interface Props {
  supply?: SupplyChainImpact | null;
}

export function SupplyChainPanel({ supply }: Props) {
  if (!supply) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        <p className="text-xs uppercase tracking-[0.3em] text-white/40">
          Supply Chain
        </p>
        <p className="mt-3 text-sm text-white/50">No supply chain data available.</p>
      </div>
    );
  }

  const metrics = [
    { label: "Food Imports", value: supply.food_imports_stress },
    { label: "Medicine Supply", value: supply.medicine_supply_stress },
    { label: "Airport Cargo", value: supply.airport_cargo_stress },
    { label: "Last-Mile Pressure", value: supply.last_mile_pressure },
  ];

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
      <p className="text-xs uppercase tracking-[0.3em] text-white/40">
        Supply Chain
      </p>
      <h3 className="mt-2 text-xl font-semibold text-white">
        Essential Goods Flow
      </h3>

      <div className="mt-4 space-y-3">
        {metrics.map(({ label, value }) => (
          <div key={label} className="space-y-1">
            <div className="flex items-center justify-between text-sm text-white/70">
              <span>{label}</span>
              <span>{value.toFixed(2)}</span>
            </div>
            <div className="h-2 rounded-full bg-white/10">
              <div
                className="h-2 rounded-full bg-emerald-400"
                style={{ width: `${Math.min(value * 100, 100)}%` }}
              />
            </div>
          </div>
        ))}

        <div className="rounded-2xl border border-emerald-400/15 bg-emerald-500/10 p-4">
          <p className="text-xs text-white/50">Supply Chain Score</p>
          <p className="mt-2 text-2xl font-semibold text-emerald-300">
            {supply.supply_chain_score.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
}
