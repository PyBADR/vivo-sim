"use client";

interface Props {
  onSelectPreset: (rawText: string) => void;
}

const presets = [
  {
    title: "US–Iran Escalation",
    description: "Escalating US-Iran tensions with sanctions and military posturing",
    text: "A significant escalation in US-Iran tensions has occurred. Comprehensive new sanctions are being imposed on Iranian financial institutions and energy exports. US military presence in the Persian Gulf has increased with additional naval deployments. Iran has threatened to close the Strait of Hormuz. This scenario will have cascading effects across energy markets, shipping routes, and economic stability in the GCC region.",
  },
  {
    title: "GCC Airspace Disruption",
    description: "Closure of critical aviation corridors affecting regional connectivity",
    text: "A temporary closure of critical GCC airspace due to military operations or security concerns has been announced. This will affect major international flight routes and increase delays for cargo and passenger flights. Airlines are being forced to use longer routes, increasing fuel costs and delivery times. Regional airports are experiencing increased congestion as alternative routing redirects traffic. This disruption affects connectivity across the Gulf and international supply chains.",
  },
  {
    title: "Oil Facility Strike",
    description: "Attack on major oil/refining infrastructure causing supply disruption",
    text: "A significant attack has damaged critical oil production and refining facilities in the GCC region. Crude oil production has been reduced and refinery capacity is constrained. Global oil prices have surged sharply. Energy prices are volatile and fuel availability is constrained for both aviation and logistics. Fuel costs for transportation and operations have increased dramatically. This supply shock will impact energy-intensive industries and create bottlenecks in distribution networks.",
  },
];

export function CrisisPresetSelector({ onSelectPreset }: Props) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
      <p className="mb-4 text-[10px] font-medium uppercase tracking-[0.35em] text-white/30">
        Crisis Scenarios
      </p>
      <div className="flex flex-wrap gap-3">
        {presets.map((preset, idx) => (
          <button
            key={idx}
            onClick={() => onSelectPreset(preset.text)}
            className="group relative flex-1 min-w-[180px] rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3 transition-all hover:border-white/[0.12] hover:bg-white/[0.04]"
            title={preset.description}
          >
            <span className="text-xs font-semibold text-white/80">
              {preset.title}
            </span>
            <p className="mt-1 text-[10px] text-white/40 leading-tight">
              {preset.description}
            </p>
            {/* Hover tooltip */}
            <div className="pointer-events-none absolute left-0 top-full z-10 mt-2 hidden w-56 rounded-lg border border-white/10 bg-black/90 p-2 text-[10px] text-white/60 group-hover:block">
              Click to load this scenario
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
