"use client";

interface ScenarioBranch {
  branch_id: string;
  label: string;
  description?: string;
}

interface ScenarioPack {
  scenario_id: string;
  title: string;
  description: string;
  branches: ScenarioBranch[];
  categories: string[];
}

interface Props {
  pack: ScenarioPack | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ScenarioPackDrawer({ pack, isOpen, onClose }: Props) {
  if (!isOpen || !pack) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="absolute inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      <div className="absolute right-0 top-0 bottom-0 w-full max-w-md overflow-y-auto bg-black/90 shadow-2xl">
        <div className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">{pack.title}</h2>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-white/60 hover:bg-white/10"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <p className="text-xs uppercase tracking-[0.2em] text-white/50">
            Scenario ID
          </p>
          <p className="mt-1 font-mono text-sm text-white/80">
            {pack.scenario_id}
          </p>

          <div className="mt-6">
            <p className="text-xs uppercase tracking-[0.2em] text-white/50">
              Description
            </p>
            <p className="mt-2 leading-6 text-white/70">
              {pack.description}
            </p>
          </div>

          <div className="mt-6">
            <p className="text-xs uppercase tracking-[0.2em] text-white/50">
              Categories
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {pack.categories.map((cat) => (
                <span
                  key={cat}
                  className="rounded-full bg-blue-500/20 px-3 py-1 text-xs text-blue-200"
                >
                  {cat}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <p className="text-xs uppercase tracking-[0.2em] text-white/50">
              Available Branches ({pack.branches.length})
            </p>
            <div className="mt-3 space-y-3">
              {pack.branches.map((branch) => (
                <div
                  key={branch.branch_id}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                >
                  <p className="font-medium text-white">{branch.label}</p>
                  {branch.description && (
                    <p className="mt-1 text-xs text-white/60">
                      {branch.description}
                    </p>
                  )}
                  <p className="mt-2 font-mono text-xs text-white/50">
                    {branch.branch_id}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
