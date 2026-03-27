import type { ECommerceImpact } from "@/lib/types/crisis";

export function ECommerceImpactPanel({ ecommerce }: { ecommerce?: ECommerceImpact | null }) {
  if (!ecommerce) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        <p className="text-sm text-white/50">No e-commerce impact data available.</p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
      <p className="text-xs uppercase tracking-[0.3em] text-white/40">
        E-Commerce Impact
      </p>
      <h3 className="mt-2 text-xl font-semibold text-white">
        Trade & Fulfillment Stress
      </h3>

      <div className="mt-4 space-y-3">
        {[
          ["Delay", ecommerce.delay],
          ["Inventory Stress", ecommerce.inventory_stress],
          ["Demand Volatility", ecommerce.demand_volatility],
          ["Payment Friction", ecommerce.payment_friction],
        ].map(([label, value]) => (
          <div key={label as string} className="space-y-1">
            <div className="flex items-center justify-between text-sm text-white/70">
              <span>{label as string}</span>
              <span>{Number(value).toFixed(2)}</span>
            </div>
            <div className="h-2 rounded-full bg-white/10">
              <div
                className="h-2 rounded-full bg-cyan-400"
                style={{ width: `${Math.min(Number(value) * 100, 100)}%` }}
              />
            </div>
          </div>
        ))}

        <div className="rounded-2xl border border-cyan-400/15 bg-cyan-500/10 p-4">
          <p className="text-xs text-white/50">E-Commerce Disruption Score</p>
          <p className="mt-2 text-2xl font-semibold text-cyan-300">
            {ecommerce.ecommerce_disruption_score.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
}
