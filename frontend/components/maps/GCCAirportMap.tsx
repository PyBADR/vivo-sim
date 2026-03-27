import type { AirportImpact } from "@/lib/types/crisis";

interface Props {
  airports: AirportImpact[];
}

const positions: Record<string, { x: number; y: number }> = {
  KWI: { x: 180, y: 120 },
  RUH: { x: 260, y: 180 },
  DMM: { x: 310, y: 165 },
  JED: { x: 210, y: 250 },
  DXB: { x: 400, y: 170 },
  AUH: { x: 370, y: 185 },
  DOH: { x: 345, y: 145 },
  BAH: { x: 320, y: 145 },
  MCT: { x: 470, y: 220 },
};

function scoreColor(score: number) {
  if (score >= 0.8) return "fill-red-500";
  if (score >= 0.6) return "fill-orange-400";
  if (score >= 0.4) return "fill-yellow-300";
  return "fill-cyan-400";
}

export function GCCAirportMap({ airports }: Props) {
  return (
    <div className="rounded-3xl border border-white/10 bg-black/40 p-5">
      <div className="mb-4">
        <p className="text-xs uppercase tracking-[0.3em] text-white/40">
          GCC Airport Map
        </p>
        <h3 className="mt-2 text-xl font-semibold text-white">
          Aviation Stress Visualization
        </h3>
      </div>

      <div className="overflow-hidden rounded-3xl border border-blue-500/10 bg-[radial-gradient(circle_at_center,_rgba(59,130,246,0.16),_transparent_40%)]">
        <svg viewBox="0 0 600 360" className="h-[360px] w-full">
          <rect x="0" y="0" width="600" height="360" fill="transparent" />

          <path
            d="M120,80 L210,70 L330,85 L440,120 L500,180 L470,260 L350,300 L220,290 L120,240 L90,150 Z"
            fill="rgba(255,255,255,0.03)"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="2"
          />

          {airports.map((airport) => {
            const pos = positions[airport.airport_code];
            if (!pos) return null;

            return (
              <g key={airport.airport_code}>
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={10 + airport.disruption_score * 10}
                  className={`${scoreColor(airport.disruption_score)} opacity-80`}
                />
                <text
                  x={pos.x + 14}
                  y={pos.y + 4}
                  fill="white"
                  fontSize="12"
                  opacity="0.9"
                >
                  {airport.airport_code}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
