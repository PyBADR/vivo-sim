/* ── Decision Intelligence API Client ── */
import { apiRequest } from "./client";
import type { DecisionIntelligenceBundle } from "@/lib/types/decision-intelligence";

export async function getDecisionIntelligence(): Promise<DecisionIntelligenceBundle> {
  return apiRequest<DecisionIntelligenceBundle>(
    "/api/v1/decision-intelligence/us-iran-gcc"
  );
}
