import { apiRequest } from "@/lib/api/client";
import type { CrisisScenarioPack, CrisisAssessment } from "@/lib/types/crisis";

export async function listCrisisPacks() {
  return apiRequest<CrisisScenarioPack[]>("/api/v1/scenarios/crisis/packs");
}

export async function getUsIranGccPack() {
  return apiRequest("/api/v1/scenarios/crisis/packs/us-iran-gcc");
}

export async function getUsIranGccAssessment() {
  return apiRequest<CrisisAssessment>("/api/v1/scenarios/crisis/packs/us-iran-gcc/assessment");
}
