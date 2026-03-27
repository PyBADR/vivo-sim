import type { MaritimeTradeImpact } from "@/lib/types/crisis";

interface Props {
  maritime?: MaritimeTradeImpact | null;
}

export function MaritimeTradePanel({ maritime }: Props) {
  if (!maritime) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        <p className="text-xs uppercase tracking-[0.3em] text-white/40">
          Maritime Trade
        </p>
        <p className="mt-3 text-sm text-white/50">No maritime data available.</p>
      </div>
    );
  }

  const metrics = [
    { label: "Chokepoint Pressure", value: maritime.chokepoint_pressure },
    { label: "Port Delay", value: maritime.port_delay },
    { label: "Insurance Cost Surge", value: maritime.insurance_cost_surge },
    { label: "Rerouting Stress", value: maritime.rerouting_stress },
  ];

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
      <p className="text-xs uppercase tracking-[0.3em] text-white/40">
        Maritime Trade
      </p>
      <h3 className="mt-2 text-xl font-semibold text-white">
        Chokepoints & Port Stress
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
                className="h-2 rounded-full bg-orange-400"
                style={{ width: `${Math.min(value * 100, 100)}%` }}
              />
            </div>
          </div>
        ))}

        <div className="rounded-2xl border border-orange-400/15 bg-orange-500/10 p-4">
          <p className="text-xs text-white/50">Maritime Trade Score</p>
          <p className="mt-2 text-2xl font-semibold text-orange-300">
            {maritime.maritime_trade_score.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
}
