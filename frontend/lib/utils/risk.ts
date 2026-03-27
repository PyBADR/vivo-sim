export function riskColor(value: number) {
  if (value >= 0.8) return "#FF5E6C";
  if (value >= 0.6) return "#FF8A4C";
  if (value >= 0.4) return "#FFB84D";
  return "#35D6FF";
}

export function riskLabel(value: number) {
  if (value >= 0.8) return "Critical";
  if (value >= 0.6) return "High";
  if (value >= 0.4) return "Medium";
  return "Low";
}
