import type { StageStatus } from "@/lib/types/control-room";

const stateColors: Record<StageStatus["state"], { dot: string; bg: string; text: string }> = {
  idle: { dot: "bg-white/20", bg: "bg-white/[0.03]", text: "text-white/40" },
  loading: { dot: "bg-blue-400 animate-pulse", bg: "bg-blue-500/[0.06]", text: "text-blue-300" },
  ready: { dot: "bg-emerald-400", bg: "bg-emerald-500/[0.06]", text: "text-emerald-300" },
  error: { dot: "bg-red-400", bg: "bg-red-500/[0.06]", text: "text-red-300" },
};

export function StatusRail({ statuses }: { statuses: StageStatus[] }) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
      <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.35em] text-white/30">
        Pipeline Status
      </p>
      <div className="space-y-2">
        {statuses.map((s) => {
          const c = stateColors[s.state];
          return (
            <div
              key={s.key}
              className={`flex items-center gap-3 rounded-xl border border-white/[0.04] px-3 py-2.5 ${c.bg}`}
            >
              <span className={`h-2 w-2 shrink-0 rounded-full ${c.dot}`} />
              <div className="min-w-0 flex-1">
                <span className={`text-xs font-medium ${c.text}`}>
                  {s.label}
                </span>
                {s.message && (
                  <p className="mt-0.5 truncate text-[10px] text-white/30">
                    {s.message}
                  </p>
                )}
              </div>
              <span
                className={`text-[9px] font-medium uppercase tracking-wider ${c.text}`}
              >
                {s.state}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
