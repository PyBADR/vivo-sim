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
  if (score >= 0.8) return "#ef4444";
  if (score >= 0.6) return "#fb923c";
  if (score >= 0.4) return "#fbbf24";
  return "#06b6d4";
}

function scoreOpacity(score: number) {
  return Math.min(0.3 + score * 0.5, 0.8);
}

export function GCCRiskHeatLayer({ airports }: Props) {
  return (
    <svg viewBox="0 0 600 360" className="h-full w-full">
      <defs>
        {airports.map((airport) => {
          const color = scoreColor(airport.disruption_score);
          const opacity = scoreOpacity(airport.disruption_score);
          const radius = 40 + airport.disruption_score * 60;

          return (
            <radialGradient
              key={`gradient-${airport.airport_code}`}
              id={`heat-${airport.airport_code}`}
              cx="50%"
              cy="50%"
              r="50%"
            >
              <stop offset="0%" stopColor={color} stopOpacity={opacity} />
              <stop offset="100%" stopColor={color} stopOpacity={opacity * 0.1} />
            </radialGradient>
          );
        })}
      </defs>

      {airports.map((airport) => {
        const pos = positions[airport.airport_code];
        if (!pos) return null;

        const radius = 40 + airport.disruption_score * 60;

        return (
          <circle
            key={`heat-${airport.airport_code}`}
            cx={pos.x}
            cy={pos.y}
            r={radius}
            fill={`url(#heat-${airport.airport_code})`}
          />
        );
      })}
    </svg>
  );
}
