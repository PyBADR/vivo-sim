import type { SocialResponseImpact } from "@/lib/types/crisis";

interface Props {
  social?: SocialResponseImpact | null;
}

export function SocialResponsePanel({ social }: Props) {
  if (!social) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        <p className="text-xs uppercase tracking-[0.3em] text-white/40">
          Social Response
        </p>
        <p className="mt-3 text-sm text-white/50">No social response data available.</p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
      <p className="text-xs uppercase tracking-[0.3em] text-white/40">
        Social Response
      </p>
      <h3 className="mt-2 text-xl font-semibold text-white">
        Public Reaction Dynamics
      </h3>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-black/25 p-4">
          <p className="text-xs text-white/45">Panic Buying</p>
          <p className="mt-2 text-2xl font-semibold text-white">
            {social.panic_buying.toFixed(2)}
          </p>
        </div>
        <div className="rounded-2xl bg-black/25 p-4">
          <p className="text-xs text-white/45">Media Amplification</p>
          <p className="mt-2 text-2xl font-semibold text-white">
            {social.media_amplification.toFixed(2)}
          </p>
        </div>
        <div className="rounded-2xl bg-black/25 p-4">
          <p className="text-xs text-white/45">Trust Loss</p>
          <p className="mt-2 text-2xl font-semibold text-red-300">
            {social.trust_loss.toFixed(2)}
          </p>
        </div>
        <div className="rounded-2xl bg-black/25 p-4">
          <p className="text-xs text-white/45">Official Stabilization</p>
          <p className="mt-2 text-2xl font-semibold text-emerald-300">
            {social.official_stabilization.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="mt-3 rounded-2xl border border-purple-400/15 bg-purple-500/10 p-4">
        <p className="text-xs text-white/50">Public Reaction Score</p>
        <p className="mt-2 text-2xl font-semibold text-purple-300">
          {social.public_reaction_score.toFixed(2)}
        </p>
      </div>
    </div>
  );
}
