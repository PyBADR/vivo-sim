"""Graph construction and enrichment service.

Pipeline position: Step 3
Input:  NormalizedScenario + Signals
Output: Entity graph (nodes + edges) with enrichment scores
"""
from __future__ import annotations

import logging
from typing import List

from app.schemas.common import EdgeType, EntityType, Stance
from app.schemas.graph import (
    EnrichedGraphNode,
    GraphBuildRequest,
    GraphBuildResponse,
    GraphEdge,
    GraphEnrichRequest,
    GraphEnrichResponse,
    GraphNode,
)

logger = logging.getLogger(__name__)


# ── GCC airport reference data ───────────────────────────────────────
GCC_AIRPORTS = {
    "DXB": {"label": "Dubai International", "region": "UAE"},
    "AUH": {"label": "Abu Dhabi International", "region": "UAE"},
    "DOH": {"label": "Hamad International", "region": "Qatar"},
    "RUH": {"label": "King Khalid International", "region": "Saudi"},
    "JED": {"label": "King Abdulaziz International", "region": "Saudi"},
    "KWI": {"label": "Kuwait International", "region": "Kuwait"},
    "BAH": {"label": "Bahrain International", "region": "Bahrain"},
    "MCT": {"label": "Muscat International", "region": "Oman"},
}

GCC_SECTORS = ["aviation", "energy", "banking", "logistics", "tourism", "insurance"]


class GraphService:
    """Builds and enriches the entity relationship graph.

    Phase 1: deterministic graph from scenario metadata + GCC reference data.
    Phase 2: dynamic graph from NER + signal correlation.
    """

    def build(self, request: GraphBuildRequest) -> GraphBuildResponse:
        """Build initial entity graph from normalized scenario."""
        nodes: List[GraphNode] = []
        edges: List[GraphEdge] = []

        scenario = request.normalized_scenario
        region = scenario.get("region", "GCC")
        trigger_type = scenario.get("trigger", {}).get("type", "market")

        # Add airport nodes for relevant region
        for code, info in GCC_AIRPORTS.items():
            if region in ("GCC", "Multi-region") or info["region"] == region:
                nodes.append(
                    GraphNode(
                        id=f"airport-{code}",
                        label=info["label"],
                        type=EntityType.AIRPORT,
                        region=info["region"],
                    )
                )

        # Add sector nodes
        for sector in GCC_SECTORS:
            nodes.append(
                GraphNode(
                    id=f"sector-{sector}",
                    label=sector.title(),
                    type=EntityType.SECTOR,
                    region=region,
                )
            )

        # Add edges: airports depend on sectors
        for node in nodes:
            if node.type == EntityType.AIRPORT:
                edges.append(
                    GraphEdge(
                        source=node.id,
                        target="sector-aviation",
                        type=EdgeType.DEPENDS_ON,
                        weight=0.9,
                    )
                )
                edges.append(
                    GraphEdge(
                        source=node.id,
                        target="sector-logistics",
                        type=EdgeType.ROUTES_THROUGH,
                        weight=0.6,
                    )
                )

        # Add cross-sector edges
        sector_dependencies = [
            ("sector-aviation", "sector-energy", EdgeType.DEPENDS_ON, 0.7),
            ("sector-aviation", "sector-tourism", EdgeType.INFLUENCES, 0.8),
            ("sector-energy", "sector-banking", EdgeType.EXPOSED_TO, 0.6),
            ("sector-logistics", "sector-energy", EdgeType.DEPENDS_ON, 0.7),
            ("sector-banking", "sector-insurance", EdgeType.INFLUENCES, 0.5),
            ("sector-tourism", "sector-logistics", EdgeType.DEPENDS_ON, 0.4),
        ]
        for src, tgt, etype, weight in sector_dependencies:
            edges.append(GraphEdge(source=src, target=tgt, type=etype, weight=weight))

        return GraphBuildResponse(
            scenario_id=request.scenario_id,
            nodes=nodes,
            edges=edges,
            confidence=0.7,
        )

    def enrich(self, request: GraphEnrichRequest) -> GraphEnrichResponse:
        """Enrich graph nodes with influence, trust, and propagation scores."""
        enriched_nodes: List[EnrichedGraphNode] = []

        # Build adjacency for degree-based scoring
        in_degree: dict[str, int] = {}
        out_degree: dict[str, int] = {}
        for edge in request.edges:
            out_degree[edge.source] = out_degree.get(edge.source, 0) + 1
            in_degree[edge.target] = in_degree.get(edge.target, 0) + 1

        max_degree = max(max(in_degree.values(), default=1), max(out_degree.values(), default=1))

        for node in request.nodes:
            in_d = in_degree.get(node.id, 0)
            out_d = out_degree.get(node.id, 0)

            influence = round(min(1.0, (in_d + out_d) / max(max_degree, 1)), 3)
            trust = self._type_trust(node.type)
            propagation = round(min(1.0, out_d / max(max_degree, 1) * 1.2), 3)

            enriched_nodes.append(
                EnrichedGraphNode(
                    id=node.id,
                    label=node.label,
                    type=node.type,
                    region=node.region,
                    metadata=node.metadata,
                    influence_score=influence,
                    trust_score=trust,
                    propagation_score=propagation,
                    stance=Stance.NEUTRAL,
                )
            )

        return GraphEnrichResponse(
            scenario_id=request.scenario_id,
            nodes=enriched_nodes,
            edges=request.edges,
            confidence=0.7,
        )

    def _type_trust(self, entity_type: EntityType) -> float:
        trust_map = {
            EntityType.REGULATOR: 0.9,
            EntityType.MINISTRY: 0.85,
            EntityType.AIRPORT: 0.8,
            EntityType.BANK: 0.75,
            EntityType.AIRLINE: 0.7,
            EntityType.SECTOR: 0.65,
            EntityType.MEDIA: 0.5,
            EntityType.PLATFORM: 0.4,
            EntityType.PUBLIC_CLUSTER: 0.35,
        }
        return trust_map.get(entity_type, 0.5)
