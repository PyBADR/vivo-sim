"use client";

import { useControlRoomStore } from "@/lib/state/controlRoomStore";
import { crCopy } from "@/lib/config/control-room-copy";
import { t } from "@/lib/utils/i18n";
import { threatColor } from "@/lib/theme/command-center-theme";

export function TopCommandBar() {
  const { state, dispatch, loadScenario } = useControlRoomStore();
  const { commandBar, lang, loading } = state;

  const toggleLang = () =>
    dispatch({ type: "SET_LANG", lang: lang === "en" ? "ar" : "en" });

  return (
    <header
      className="flex items-center justify-between border-b border-white/[0.06] bg-[#080c18]/90 px-4 backdrop-blur-md"
      style={{ gridArea: "cmdbar" }}
    >
      {/* Left — Title + Scenario */}
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-blue-400/80">
            {t(crCopy.commandBar.title, lang)}
          </span>
        </div>

        <div className="h-4 w-px bg-white/10" />

        <span className="text-[11px] text-white/50">
          {t(crCopy.commandBar.scenario, lang)}:{" "}
          <span className="text-white/80">{commandBar.scenarioTitle}</span>
        </span>
      </div>

      {/* Center — Status Indicators */}
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-wider text-white/35">
            {t(crCopy.commandBar.threat, lang)}
          </span>
          <span
            className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${threatColor(commandBar.threatLevel)}`}
            style={{
              borderColor:
                commandBar.threatLevel === "critical"
                  ? "rgba(248,113,113,0.3)"
                  : commandBar.threatLevel === "high"
                  ? "rgba(251,146,60,0.3)"
                  : "rgba(255,255,255,0.1)",
              backgroundColor:
                commandBar.threatLevel === "critical"
                  ? "rgba(248,113,113,0.1)"
                  : commandBar.threatLevel === "high"
                  ? "rgba(251,146,60,0.1)"
                  : "rgba(255,255,255,0.03)",
            }}
          >
            {t(crCopy.threats[commandBar.threatLevel] ?? crCopy.threats.low, lang)}
          </span>
        </div>

        <div className="h-4 w-px bg-white/10" />

        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-wider text-white/35">
            {t(crCopy.commandBar.phase, lang)}
          </span>
          <span className="text-[11px] text-white/70">
            {t(crCopy.phases[commandBar.currentPhase] ?? crCopy.phases.detection, lang)}
          </span>
        </div>

        <div className="h-4 w-px bg-white/10" />

        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-wider text-white/35">
            {t(crCopy.commandBar.confidence, lang)}
          </span>
          <span className="text-[11px] font-medium text-white">
            {commandBar.confidenceScore > 0
              ? `${Math.round(commandBar.confidenceScore * 100)}%`
              : "—"}
          </span>
        </div>
      </div>

      {/* Right — Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleLang}
          className="rounded-md border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-[10px] text-white/50 transition-colors hover:bg-white/[0.06]"
        >
          {t(crCopy.lang.toggle, lang)}
        </button>

        <button
          onClick={loadScenario}
          disabled={loading}
          className="rounded-md bg-blue-600/80 px-4 py-1 text-[11px] font-medium text-white transition-colors hover:bg-blue-600 disabled:opacity-50"
        >
          {loading
            ? t(crCopy.commandBar.loading, lang)
            : t(crCopy.commandBar.loadScenario, lang)}
        </button>
      </div>
    </header>
  );
}
