import type { BranchedSimulationResponse } from "@/lib/types/simulation";

interface Props {
  simulation: BranchedSimulationResponse | null;
}

export function TimelinePanel({ simulation }: Props) {
  const series = simulation?.aggregate_energy_series ?? [];
  const maxValue = series.length
    ? Math.max(...series.map((p) => p.value), 0.01)
    : 1;

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.35em] text-white/30">
            Timeline
          </p>
          <h3 className="mt-1 text-lg font-semibold">Propagation Energy</h3>
        </div>
        {series.length > 0 && (
          <span className="text-xs text-white/40">
            Peak: {maxValue.toFixed(3)} at t
            {series.reduce((max, p) => (p.value > max.value ? p : max), series[0]).step}
          </span>
        )}
      </div>

      <div className="rounded-xl border border-white/[0.04] bg-black/30 p-4">
        {series.length > 0 ? (
          <div className="space-y-2">
            {/* Bar chart */}
            <div className="flex items-end gap-1" style={{ height: "120px" }}>
              {series.map((point) => {
                const pct = (point.value / maxValue) * 100;
                const isMax = point.value === maxValue;
                return (
                  <div
                    key={point.step}
                    className="group relative flex flex-1 flex-col items-center justify-end"
                    style={{ height: "100%" }}
                  >
                    <div
                      className={`w-full rounded-t transition-all ${
                        isMax ? "bg-red-400/80" : "bg-blue-400/60"
                      } group-hover:bg-blue-300`}
                      style={{ height: `${Math.max(pct, 2)}%` }}
                    />
                    {/* Tooltip */}
                    <div className="absolute -top-6 hidden rounded bg-black/80 px-2 py-0.5 text-[9px] text-white group-hover:block">
                      {point.value.toFixed(3)}
                    </div>
                  </div>
                );
              })}
            </div>
            {/* X-axis labels */}
            <div className="flex gap-1">
              {series.map((point) => (
                <div
                  key={point.step}
                  className="flex-1 text-center text-[9px] text-white/30"
                >
                  t{point.step}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="py-8 text-center text-xs text-white/20">
            No simulation trajectory yet.
          </p>
        )}
      </div>
    </div>
  );
}
