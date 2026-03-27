import type { CrisisAssessment } from "@/lib/types/crisis";

export function CrisisSummaryPanel({ assessment }: { assessment?: CrisisAssessment | null }) {
  if (!assessment) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        <p className="text-sm text-white/50">No crisis summary loaded yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-blue-500/20 bg-blue-500/10 p-5">
      <p className="text-xs uppercase tracking-[0.3em] text-blue-200">
        Crisis Summary
      </p>
      <h3 className="mt-2 text-xl font-semibold text-white">
        {assessment.scenario_id}
      </h3>

      <p className="mt-4 text-sm leading-6 text-white/75">
        {assessment.summary}
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-2xl bg-black/20 p-4">
          <p className="text-white/45">Branch</p>
          <p className="mt-2 font-medium text-white">
            {assessment.branch_id ?? "—"}
          </p>
        </div>
        <div className="rounded-2xl bg-black/20 p-4">
          <p className="text-white/45">Top Action</p>
          <p className="mt-2 font-medium text-white">
            {assessment.ranked_actions?.[0]?.label ?? "—"}
          </p>
        </div>
      </div>
    </div>
  );
}
