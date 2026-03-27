import type { ExecutiveActionBundle } from "@/lib/types/crisis";

interface Props {
  executive?: ExecutiveActionBundle | null;
}

export function ExecutiveActionBundlePanel({ executive }: Props) {
  if (!executive) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        <p className="text-xs uppercase tracking-[0.3em] text-white/40">
          Executive Action Bundle
        </p>
        <p className="mt-3 text-sm text-white/50">No executive actions computed.</p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-blue-500/20 bg-blue-500/[0.06] p-5">
      <p className="text-xs uppercase tracking-[0.3em] text-blue-200">
        Executive Action Bundle
      </p>
      <h3 className="mt-2 text-xl font-semibold text-white">
        Decision Intelligence
      </h3>

      {/* Primary Action */}
      <div className="mt-4 rounded-2xl border border-blue-400/20 bg-blue-500/10 p-4">
        <p className="text-[10px] uppercase tracking-wider text-blue-300/60">
          Primary Action
        </p>
        <p className="mt-2 text-sm font-medium leading-6 text-white">
          {executive.primary_action}
        </p>
      </div>

      {/* Secondary Actions */}
      {executive.secondary_actions.length > 0 && (
        <div className="mt-3">
          <p className="mb-2 text-xs text-white/40">Secondary Actions</p>
          <div className="space-y-1.5">
            {executive.secondary_actions.map((action, i) => (
              <div
                key={i}
                className="rounded-xl bg-black/20 px-3 py-2 text-xs text-white/65"
              >
                {action}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Risks */}
      {executive.top_risks.length > 0 && (
        <div className="mt-3">
          <p className="mb-2 text-xs text-white/40">Top Risks</p>
          <div className="flex flex-wrap gap-1.5">
            {executive.top_risks.map((risk) => (
              <span
                key={risk}
                className="rounded-full border border-red-500/20 bg-red-500/10 px-2.5 py-1 text-[10px] text-red-300"
              >
                {risk}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Critical Nodes */}
      {executive.top_nodes.length > 0 && (
        <div className="mt-3">
          <p className="mb-2 text-xs text-white/40">Critical Nodes</p>
          <div className="flex flex-wrap gap-1.5">
            {executive.top_nodes.map((node) => (
              <span
                key={node}
                className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[10px] text-white/60"
              >
                {node}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Decision Summary */}
      <div className="mt-4 rounded-2xl bg-black/20 p-4">
        <p className="text-xs text-white/40">Decision Summary</p>
        <p className="mt-2 text-sm leading-6 text-white/75">
          {executive.decision_summary}
        </p>
      </div>
    </div>
  );
}
