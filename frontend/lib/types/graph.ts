/**
 * Graph types — aligned with backend GraphBuildResponse, GraphEnrichResponse.
 */

export interface GraphNode {
  id: string;
  label: string;
  type?: string;
  region?: string;
  metadata?: Record<string, unknown>;
  importance_score?: number;
  degree_centrality?: number;
  betweenness_centrality?: number;
}

export interface EnrichedGraphNode extends GraphNode {
  influence_score?: number;
  trust_score?: number;
  propagation_score?: number;
  stance?: string;
}

export interface GraphEdge {
  source: string;
  target: string;
  type?: string;
  relationship?: string;
  weight?: number;
  confidence?: number;
  edge_type?: string;
  metadata?: Record<string, unknown>;
}

export interface GraphBuildResponse {
  confidence: number;
  scenario_id: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
  graph_summary?: {
    node_count: number;
    edge_count: number;
    density?: number;
  };
}

export interface GraphEnrichResponse {
  confidence: number;
  scenario_id: string;
  nodes: EnrichedGraphNode[];
  edges: GraphEdge[];
  enrichment_confidence?: number;
  enrichment_summary?: string;
}
