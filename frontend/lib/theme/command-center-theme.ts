/* ── Command Center Enterprise Dark Theme ──
   Palantir-class design tokens for the 5-zone control room.
   60fps target: prefer GPU-composited properties (transform, opacity). */

export const ccTheme = {
  /* ── Surface Palette ── */
  bg: {
    primary: "#060810",       // Deepest background
    secondary: "#0a0e1a",     // Panel backgrounds
    tertiary: "#0f1424",      // Elevated cards
    hover: "rgba(255,255,255,0.03)",
    active: "rgba(255,255,255,0.06)",
  },

  /* ── Border ── */
  border: {
    subtle: "rgba(255,255,255,0.06)",
    medium: "rgba(255,255,255,0.10)",
    focus: "rgba(59,130,246,0.40)",
  },

  /* ── Text ── */
  text: {
    primary: "#ffffff",
    secondary: "rgba(255,255,255,0.70)",
    tertiary: "rgba(255,255,255,0.45)",
    muted: "rgba(255,255,255,0.25)",
  },

  /* ── Status Colors ── */
  status: {
    critical: { text: "#f87171", bg: "rgba(248,113,113,0.12)", border: "rgba(248,113,113,0.25)" },
    high: { text: "#fb923c", bg: "rgba(251,146,60,0.12)", border: "rgba(251,146,60,0.25)" },
    elevated: { text: "#fbbf24", bg: "rgba(251,191,36,0.12)", border: "rgba(251,191,36,0.25)" },
    guarded: { text: "#60a5fa", bg: "rgba(96,165,250,0.12)", border: "rgba(96,165,250,0.25)" },
    low: { text: "#34d399", bg: "rgba(52,211,153,0.12)", border: "rgba(52,211,153,0.25)" },
  },

  /* ── Accent ── */
  accent: {
    blue: "#3b82f6",
    cyan: "#06b6d4",
    amber: "#f59e0b",
    emerald: "#10b981",
    red: "#ef4444",
    purple: "#8b5cf6",
  },

  /* ── Typography ── */
  font: {
    mono: "'SF Mono', 'Fira Code', 'Cascadia Code', monospace",
    label: "0.625rem",      // 10px
    caption: "0.6875rem",   // 11px
    body: "0.8125rem",      // 13px
    title: "0.875rem",      // 14px
    heading: "1.125rem",    // 18px
  },

  /* ── Spacing ── */
  space: {
    xs: "0.25rem",
    sm: "0.5rem",
    md: "0.75rem",
    lg: "1rem",
    xl: "1.5rem",
  },

  /* ── Radii ── */
  radius: {
    sm: "0.375rem",
    md: "0.5rem",
    lg: "0.75rem",
    xl: "1rem",
    full: "9999px",
  },

  /* ── Grid Layout (CSS Grid Areas) ── */
  grid: {
    areas: `
      "cmdbar   cmdbar   cmdbar"
      "left     globe    right"
      "timeline timeline timeline"
    `,
    columns: "280px 1fr 320px",
    rows: "48px 1fr 160px",
  },
} as const;

/* ── Threat Level → Tailwind Class Mappings ── */

export function threatColor(level: string): string {
  switch (level) {
    case "critical": return "text-red-400";
    case "high": return "text-orange-400";
    case "elevated": return "text-amber-400";
    case "guarded": return "text-blue-400";
    case "low": return "text-emerald-400";
    default: return "text-white/50";
  }
}

export function threatBg(level: string): string {
  switch (level) {
    case "critical": return "bg-red-500/12 border-red-500/25";
    case "high": return "bg-orange-500/12 border-orange-500/25";
    case "elevated": return "bg-amber-500/12 border-amber-500/25";
    case "guarded": return "bg-blue-500/12 border-blue-500/25";
    case "low": return "bg-emerald-500/12 border-emerald-500/25";
    default: return "bg-white/[0.03] border-white/[0.06]";
  }
}

export function severityColor(value: number): string {
  if (value >= 0.8) return "text-red-400";
  if (value >= 0.6) return "text-orange-400";
  if (value >= 0.4) return "text-amber-400";
  if (value >= 0.2) return "text-blue-400";
  return "text-emerald-400";
}

export function severityBarColor(value: number): string {
  if (value >= 0.8) return "bg-red-400";
  if (value >= 0.6) return "bg-orange-400";
  if (value >= 0.4) return "bg-amber-400";
  if (value >= 0.2) return "bg-blue-400";
  return "bg-emerald-400";
}
