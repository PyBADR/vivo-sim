/**
 * Signal types — aligned with backend SignalExtractionResponse + Signal.
 */

export interface Signal {
  id: string;
  source: string;
  kind: string;
  severity: number;
  confidence: number;
  relevance?: number;
  score?: number;
  label?: string;
  dimension?: string;
}

export interface SignalsResponse {
  confidence: number;
  scenario_id: string;
  signals: Signal[];
  extracted_count: number;
}
