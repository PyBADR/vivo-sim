import type { AirportImpact } from "@/lib/types/crisis";

interface Props {
  airports: AirportImpact[];
}

export function AirportImpactPanel({ airports }: Props) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
      <p className="text-xs uppercase tracking-[0.3em] text-white/40">
        Airport Impact
      </p>
      <h3 className="mt-2 text-xl font-semibold text-white">
        GCC Airport Stress Scores
      </h3>

      <div className="mt-4 space-y-3">
        {airports
          .slice()
          .sort((a, b) => b.disruption_score - a.disruption_score)
          .map((airport) => (
            <div
              key={airport.airport_code}
              className="rounded-2xl border border-white/8 bg-black/20 p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">
                    {airport.airport_name}
                  </p>
                  <p className="text-xs text-white/45">{airport.airport_code}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-white/60">Score</p>
                  <p className="text-lg font-semibold text-blue-300">
                    {airport.disruption_score.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-white/55">
                <div>Rerouting: {airport.rerouting_pressure.toFixed(2)}</div>
                <div>Fuel: {airport.fuel_stress.toFixed(2)}</div>
                <div>Congestion: {airport.congestion_pressure.toFixed(2)}</div>
                <div>Insurance: {airport.insurance_operating_stress.toFixed(2)}</div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
