"use client";

interface Props {
  title: string;
  description: string;
  tags: string[];
  isActive: boolean;
  onClick: () => void;
}

export function ScenarioPresetCard({
  title,
  description,
  tags,
  isActive,
  onClick,
}: Props) {
  return (
    <button
      onClick={onClick}
      className={`w-full rounded-3xl border p-5 transition ${
        isActive
          ? "border-blue-500/40 bg-blue-500/10"
          : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]"
      }`}
    >
      <div className="text-left">
        <div className="flex items-start justify-between">
          <h4 className="text-lg font-semibold text-white">{title}</h4>
          {isActive && (
            <div className="h-3 w-3 rounded-full bg-blue-400" />
          )}
        </div>

        <p className="mt-2 text-sm leading-5 text-white/65">
          {description}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </button>
  );
}
