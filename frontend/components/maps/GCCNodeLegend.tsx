"use client";

interface LegendEntry {
  label: string;
  color: string;
  range: string;
}

const legendEntries: LegendEntry[] = [
  {
    label: "Low Risk",
    color: "bg-cyan-400",
    range: "0.0–0.4",
  },
  {
    label: "Medium Risk",
    color: "bg-yellow-300",
    range: "0.4–0.6",
  },
  {
    label: "High Risk",
    color: "bg-orange-400",
    range: "0.6–0.8",
  },
  {
    label: "Critical Risk",
    color: "bg-red-500",
    range: "0.8–1.0",
  },
];

export function GCCNodeLegend() {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
      <p className="text-xs uppercase tracking-[0.3em] text-white/40">
        Risk Scale
      </p>
      <h3 className="mt-2 text-lg font-semibold text-white">
        Disruption Score Legend
      </h3>

      <div className="mt-5 space-y-3">
        {legendEntries.map((entry) => (
          <div key={entry.label} className="flex items-center gap-3">
            <div className={`h-4 w-4 rounded-full ${entry.color} flex-shrink-0`} />
            <div className="flex-1">
              <p className="text-sm font-medium text-white">{entry.label}</p>
              <p className="text-xs text-white/55">{entry.range}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
