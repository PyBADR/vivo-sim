from typing import List
from app.schemas.entity import EntityOut


async def extract_entities(text: str, language: str) -> List[EntityOut]:
    """Extract entities from text using keyword-based approach for MVP."""
    # Simple keyword extraction
    words = text.split()
    keywords = [w for w in words if len(w) > 3][:5]

    entities = []
    entity_types = ["organization", "person", "location", "event", "concept"]

    for i, keyword in enumerate(keywords):
        entity = EntityOut(
            id=f"entity_{i}",
            name=keyword,
            name_en=keyword if language != "en" else None,
            type=entity_types[i % len(entity_types)],
            weight=0.7 + (i * 0.05)
        )
        entities.append(entity)

    return entities
