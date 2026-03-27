import type { NormalizeResponse } from "@/lib/types/scenario";
import type { SignalsResponse } from "@/lib/types/signals";

interface Props {
  normalize: NormalizeResponse | null;
  signals: SignalsResponse | null;
}

export function SituationFeed({ normalize, signals }: Props) {
  const hasData = normalize || signals;

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
      <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.35em] text-white/30">
        Situation Feed
      </p>

      {!hasData && (
        <p className="py-6 text-center text-xs text-white/20">
          Run a scenario to populate the situation feed.
        </p>
      )}

      {/* Normalized scenario */}
      {normalize && (
        <div className="mb-3">
          <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-white/40">
            Scenario Profile
          </p>
          <div className="space-y-1.5">
            {[
              ["Title", normalize.title],
              ["Region", normalize.region],
              ["Domain", normalize.domain],
              ["Trigger", normalize.trigger?.label],
              ["Severity", normalize.trigger?.severity != null ? `${(normalize.trigger.severity * 100).toFixed(0)}%` : undefined],
              ["Horizon", normalize.time_horizon_hours ? `${normalize.time_horizon_hours}h` : undefined],
              ["Actors", normalize.actors?.length ? normalize.actors.join(", ") : undefined],
              ["Signals", normalize.signal_categories?.join(", ")],
            ]
              .filter(([, val]) => val)
              .map(([key, val]) => (
                <div
                  key={key as string}
                  className="flex items-start justify-between gap-2 rounded-lg bg-black/20 px-3 py-2"
                >
                  <span className="text-[11px] text-white/50">{key}</span>
                  <span
                    className="max-w-[60%] text-right text-[11px] text-white/80"
                    dir="auto"
                  >
                    {val}
                  </span>
                </div>
              ))}
          </div>
          <div className="mt-2 flex items-center gap-2 text-[10px] text-white/30">
            <span>
              Confidence: {Math.round(normalize.confidence * 100)}%
            </span>
            {normalize.constraints?.length > 0 && (
              <span className="text-amber-400/60">
                {normalize.constraints.length} constraint
                {normalize.constraints.length > 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Signals */}
      {signals && signals.signals.length > 0 && (
        <div>
          <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-white/40">
            Signals ({signals.signals.length})
          </p>
          <div className="space-y-1.5">
            {signals.signals.slice(0, 8).map((sig) => (
              <div
                key={sig.id}
                className="flex items-center justify-between rounded-lg bg-black/20 px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-[11px] text-white/70">
                    {sig.label ?? sig.kind}
                  </p>
                  <p className="text-[10px] text-white/30">{sig.dimension ?? sig.source}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-12 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-blue-400"
                      style={{
                        width: `${Math.min(sig.severity * 100, 100)}%`,
                      }}
                    />
                  </div>
                  <span className="w-8 text-right text-[10px] text-white/40">
                    {(sig.severity * 100).toFixed(0)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
