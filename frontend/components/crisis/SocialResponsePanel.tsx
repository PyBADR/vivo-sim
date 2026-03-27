"use client";

import type { SocialResponseImpact } from "@/lib/types/crisis";
import { decisionCopy } from "@/lib/config/decision-copy";
import { t } from "@/lib/utils/i18n";
import type { Lang } from "@/lib/types/i18n";

interface Props {
  social?: SocialResponseImpact | null;
  lang?: Lang;
}

function getRiskColor(value: number): string {
  if (value >= 0.7) return "text-red-400";
  if (value >= 0.5) return "text-amber-400";
  return "text-white";
}

export function SocialResponsePanel({ social, lang = "en" }: Props) {
  const c = decisionCopy.impact.social;

  if (!social) {
    return (
      <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] p-5">
        <p className="text-xs uppercase tracking-[0.3em] text-white/40">
          {t(c.title, lang)}
        </p>
        <p className="mt-3 text-sm text-white/30">{t(c.noData, lang)}</p>
      </div>
    );
  }

  const metrics = [
    { label: c.panicBuying, value: social.panic_buying, negative: true },
    { label: c.mediaAmplification, value: social.media_amplification, negative: true },
    { label: c.trustLoss, value: social.trust_loss, negative: true },
    { label: c.officialStabilization, value: social.official_stabilization, negative: false },
  ];

  return (
    <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] p-5 space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-white/40">
          {t(c.title, lang)}
        </p>
        <p className="mt-2 text-sm text-white/60 leading-relaxed">
          {t(c.headline, lang)}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {metrics.map(({ label, value, negative }) => (
          <div key={label.en} className="rounded-2xl bg-black/25 p-3 space-y-1">
            <p className="text-[10px] uppercase tracking-wider text-white/40">
              {t(label, lang)}
            </p>
            <p className={`text-xl font-semibold ${negative ? getRiskColor(value) : "text-emerald-300"}`}>
              {Math.round(value * 100)}%
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-purple-400/15 bg-purple-500/10 p-4">
        <div className="flex items-center justify-between">
          <p className="text-xs text-white/50">{t(c.score, lang)}</p>
          <p className={`text-2xl font-semibold ${getRiskColor(social.public_reaction_score)}`}>
            {Math.round(social.public_reaction_score * 100)}%
          </p>
        </div>
      </div>

      <div className="rounded-xl bg-white/[0.03] px-4 py-3">
        <p className="text-[10px] uppercase tracking-wider text-amber-300/60 mb-1">
          {t(decisionCopy.actions.whyItMatters, lang)}
        </p>
        <p className="text-[11px] text-white/50 leading-relaxed">
          {t(c.implication, lang)}
        </p>
      </div>
    </div>
  );
}
