import json
import math
import uuid
from pathlib import Path
from typing import List, Optional

from app.schemas.graph import GraphBuildInput, GraphResponse, GraphNode, GraphEdge
from app.schemas.entity import EntityOut


def _get_seeds_dir() -> Path:
    """Get the seeds directory path."""
    backend_dir = Path(__file__).resolve().parent.parent.parent.parent
    return backend_dir.parent / "seeds"


def _load_seed_graph(scenario_id: str) -> Optional[dict]:
    """Load seed graph data for known scenarios."""
    try:
        seeds_dir = _get_seeds_dir()
        # Extract scenario type from id or try to load generic graph
        seed_file = seeds_dir / "graph_seed.json"

        if seed_file.exists():
            with open(seed_file, 'r', encoding='utf-8') as f:
                return json.load(f)
    except Exception:
        pass
    return None


def _create_circular_layout(count: int) -> List[tuple]:
    """Create circular layout positions for nodes."""
    positions = []
    radius = 300
    angle_step = 2 * math.pi / max(count, 1)

    for i in range(count):
        angle = i * angle_step
        x = radius * math.cos(angle)
        y = radius * math.sin(angle)
        positions.append((x, y))

    return positions


async def build_graph(input_data: GraphBuildInput) -> GraphResponse:
    """Build a knowledge graph from scenario entities."""
    try:
        scenario_id = input_data.scenario_id
        entities = input_data.entities

        # Try loading seed graph
        seed_graph = _load_seed_graph(scenario_id)

        if seed_graph:
            nodes = [GraphNode(**n) for n in seed_graph.get('nodes', [])]
            edges = [GraphEdge(**e) for e in seed_graph.get('edges', [])]
        else:
            # Generate graph from entities
            positions = _create_circular_layout(len(entities))
            nodes = []

            for i, entity in enumerate(entities):
                x, y = positions[i]
                node = GraphNode(
                    id=entity.id,
                    label=entity.name,
                    label_en=entity.name_en,
                    type=entity.type,
                    metadata={"x": x, "y": y, "weight": entity.weight}
                )
                nodes.append(node)

            # Generate edges between related entities
            edges = []
            edge_relations = [
                "influences", "related_to", "connected_to", "supports", "opposes"
            ]

            for i, entity1 in enumerate(entities):
                for j, entity2 in enumerate(entities):
                    if i < j:  # Avoid duplicate edges
                        edge = GraphEdge(
                            id=f"edge_{uuid.uuid4().hex[:8]}",
                            source=entity1.id,
                            target=entity2.id,
                            relation=edge_relations[i % len(edge_relations)],
                            weight=0.5 + ((i + j) % 10) / 20
                        )
                        edges.append(edge)

        return GraphResponse(
            scenario_id=scenario_id,
            nodes=nodes,
            edges=edges
        )

    except Exception as e:
        # Fallback: return empty graph
        return GraphResponse(
            scenario_id=input_data.scenario_id,
            nodes=[],
            edges=[]
        )
