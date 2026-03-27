export const RISK_COLORS = {
  low: "#22d3ee",
  medium: "#facc15",
  high: "#fb923c",
  critical: "#ef4444",
};

export type RiskBand = "low" | "medium" | "high" | "critical";

export function getRiskBand(value: number): RiskBand {
  if (value >= 0.8) return "critical";
  if (value >= 0.6) return "high";
  if (value >= 0.4) return "medium";
  return "low";
}

export function getRiskColor(value: number): string {
  return RISK_COLORS[getRiskBand(value)];
}

export function getRiskLabel(band: RiskBand): string {
  const labels: Record<RiskBand, string> = {
    low: "Low Risk",
    medium: "Moderate",
    high: "High Risk",
    critical: "Critical",
  };
  return labels[band];
}
