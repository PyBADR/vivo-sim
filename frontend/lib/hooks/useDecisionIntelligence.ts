"use client";

import { useState, useCallback } from "react";
import type { DecisionIntelligenceBundle } from "@/lib/types/decision-intelligence";
import { getDecisionIntelligence } from "@/lib/api/decision-intelligence";

export function useDecisionIntelligence() {
  const [bundle, setBundle] = useState<DecisionIntelligenceBundle | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDecisionIntelligence = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDecisionIntelligence();
      setBundle(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load decision intelligence"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  return { bundle, loading, error, loadDecisionIntelligence };
}
