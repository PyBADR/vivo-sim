/**
 * Runtime validators for branched pipeline payloads.
 * These check that outgoing payloads match backend Pydantic schemas
 * before the request is sent — catching contract drift at the boundary.
 */

export function hasObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function hasArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

export function hasNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/** Validates payload matches SimulationRunRequest */
export function assertSimulationPayloadShape(payload: unknown): void {
  if (!hasObject(payload)) throw new Error("Payload must be an object");

  if (!hasNonEmptyString(payload.scenario_id))
    throw new Error("Payload missing scenario_id (string, required)");

  if (!hasObject(payload.normalized_scenario))
    throw new Error("Payload missing normalized_scenario (object, required)");

  if (!hasArray(payload.signals))
    throw new Error("Payload missing signals (array, required)");

  if (!hasArray(payload.nodes))
    throw new Error("Payload missing nodes (array, required)");

  if (!hasArray(payload.edges))
    throw new Error("Payload missing edges (array, required)");
}

/** Validates payload matches BranchedDecisionRequest */
export function assertDecisionPayloadShape(payload: unknown): void {
  if (!hasObject(payload)) throw new Error("Payload must be an object");

  if (!hasNonEmptyString(payload.scenario_id))
    throw new Error("Payload missing scenario_id");

  if (!hasObject(payload.simulation_response))
    throw new Error("Payload missing simulation_response (object, required)");
}

/** Validates payload matches BranchedBriefRequest */
export function assertBriefPayloadShape(payload: unknown): void {
  if (!hasObject(payload)) throw new Error("Payload must be an object");

  if (!hasNonEmptyString(payload.scenario_id))
    throw new Error("Payload missing scenario_id");

  if (!hasObject(payload.decision_output))
    throw new Error("Payload missing decision_output (object, required)");

  if (!hasObject(payload.simulation_response))
    throw new Error("Payload missing simulation_response (object, required)");
}

/** Validates payload matches BranchedAnalysisRequest */
export function assertAnalysisPayloadShape(payload: unknown): void {
  if (!hasObject(payload)) throw new Error("Payload must be an object");

  if (!hasNonEmptyString(payload.scenario_id))
    throw new Error("Payload missing scenario_id");

  if (!hasNonEmptyString(payload.question))
    throw new Error("Payload missing question");

  if (!hasObject(payload.decision_output))
    throw new Error("Payload missing decision_output (object, required)");

  if (!hasObject(payload.intelligence_brief))
    throw new Error("Payload missing intelligence_brief (object, required)");

  if (!hasObject(payload.simulation_response))
    throw new Error("Payload missing simulation_response (object, required)");
}
