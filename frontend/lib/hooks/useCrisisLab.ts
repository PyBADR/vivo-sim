"use client";

import { useEffect, useMemo, useState } from "react";
import { getUsIranGccAssessment } from "@/lib/api/crisis";
import type { CrisisAssessment } from "@/lib/types/crisis";

export function useCrisisLab() {
  const [assessment, setAssessment] = useState<CrisisAssessment | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDefaultScenario = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getUsIranGccAssessment();
      setAssessment(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load crisis assessment");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadDefaultScenario();
  }, []);

  const topAirports = useMemo(() => {
    return [...(assessment?.airport_impacts ?? [])]
      .sort((a, b) => b.disruption_score - a.disruption_score)
      .slice(0, 5);
  }, [assessment]);

  return {
    assessment,
    loading,
    error,
    loadDefaultScenario,
    topAirports,
  };
}
