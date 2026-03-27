import type { CrisisAssessment } from "@/lib/types/crisis";

interface Props {
  assessment?: CrisisAssessment | null;
}

export function MonitoringStrip({ assessment }: Props) {
  const maxAirportStress = assessment?.airport_impacts
    ? Math.max(...assessment.airport_impacts.map((a) => a.disruption_score))
    : 0;

  const totalEnergy = assessment?.propagation?.[assessment.propagation.length - 1]?.total_energy ?? 0;

  const metrics = [
    { label: "Scenario", value: assessment?.scenario_id ?? "—" },
    { label: "Branch", value: assessment?.branch_id ?? "—" },
    { label: "Total Energy", value: totalEnergy.toFixed(2) },
    { label: "Max Airport Stress", value: maxAirportStress.toFixed(2) },
    { label: "Fuel Impact", value: assessment?.energy_impact?.fuel_impact_score?.toFixed(2) ?? "—" },
    { label: "Market Stress", value: assessment?.financial_stress_impact?.market_stress_score?.toFixed(2) ?? "—" },
    { label: "Public Reaction", value: assessment?.social_response_impact?.public_reaction_score?.toFixed(2) ?? "—" },
    { label: "Top Action", value: assessment?.ranked_actions?.[0]?.label ?? "—" },
  ];

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex flex-wrap items-center gap-4">
        {metrics.map((m) => (
          <div key={m.label} className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-wider text-white/30">
              {m.label}
            </span>
            <span className="text-xs font-medium text-white/80">{m.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
