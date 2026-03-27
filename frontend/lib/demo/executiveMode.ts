/* ── Executive Mode ──
   Toggle between Executive View (boardroom-ready, compressed)
   and Analyst View (full detail). Does not remount the app —
   reads from a simple state flag that UI components check. */

export type ViewMode = "executive" | "analyst";

/* ── Executive View: what to show / hide ── */

export interface ExecutiveVisibility {
  showDetailedGraph: boolean;         // Low-priority graph nodes
  showSecondaryNarrative: boolean;    // Deep analytic text
  showAnalyticDriverDetail: boolean;  // Driver detail rows
  showAllEntities: boolean;           // Full entity list
  showAllInsuranceLines: boolean;     // All insurance line cards
  showTimeBands: boolean;             // Time-to-impact bands (always show)
  showModelInputs: boolean;           // Model inputs summary
  showKnownLimitations: boolean;      // Known limitations list
  maxEntities: number;                // Max entities in list
  maxDrivers: number;                 // Max drivers shown
  maxLines: number;                   // Max insurance lines
  maxActions: number;                 // Max action items
}

const EXECUTIVE_VISIBILITY: ExecutiveVisibility = {
  showDetailedGraph: false,
  showSecondaryNarrative: false,
  showAnalyticDriverDetail: false,
  showAllEntities: false,
  showAllInsuranceLines: false,
  showTimeBands: true,
  showModelInputs: false,
  showKnownLimitations: false,
  maxEntities: 3,
  maxDrivers: 2,
  maxLines: 2,
  maxActions: 3,
};

const ANALYST_VISIBILITY: ExecutiveVisibility = {
  showDetailedGraph: true,
  showSecondaryNarrative: true,
  showAnalyticDriverDetail: true,
  showAllEntities: true,
  showAllInsuranceLines: true,
  showTimeBands: true,
  showModelInputs: true,
  showKnownLimitations: true,
  maxEntities: 8,
  maxDrivers: 5,
  maxLines: 6,
  maxActions: 8,
};

export function getVisibility(mode: ViewMode): ExecutiveVisibility {
  return mode === "executive" ? EXECUTIVE_VISIBILITY : ANALYST_VISIBILITY;
}

/**
 * Labels for the toggle UI.
 */
export const VIEW_MODE_LABELS = {
  executive: { en: "Executive View", ar: "\u0627\u0644\u0639\u0631\u0636 \u0627\u0644\u062a\u0646\u0641\u064a\u0630\u064a" },
  analyst: { en: "Analyst View", ar: "\u0639\u0631\u0636 \u0627\u0644\u0645\u062d\u0644\u0644" },
} as const;
