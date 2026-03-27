export function pct(value?: number | null) {
  if (value == null) return "—";
  return `${Math.round(value * 100)}%`;
}

export function score(value?: number | null) {
  if (value == null) return "—";
  return value.toFixed(2);
}

export function hours(value?: number | null) {
  if (value == null) return "—";
  return `${value}h`;
}
