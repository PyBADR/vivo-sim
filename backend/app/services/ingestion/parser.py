import json
import uuid
from datetime import datetime
from pathlib import Path
from typing import List, Optional

from app.schemas.scenario import ScenarioInput, ScenarioResponse, EntityOut


def _get_seeds_dir() -> Path:
    """Get the seeds directory path."""
    backend_dir = Path(__file__).resolve().parent.parent.parent.parent
    return backend_dir.parent / "seeds"


def _detect_language(text: str) -> str:
    """Detect language by checking for Arabic characters."""
    # Check for Arabic Unicode range
    for char in text:
        if '\u0600' <= char <= '\u06FF':
            return "ar"
    return "en"


def _load_seed_entities(scenario_type: str) -> Optional[List[dict]]:
    """Load seed entities for known scenarios."""
    try:
        seeds_dir = _get_seeds_dir()
        seed_file = seeds_dir / f"{scenario_type}_entities.json"

        if seed_file.exists():
            with open(seed_file, 'r', encoding='utf-8') as f:
                return json.load(f)
    except Exception:
        pass
    return None


def _extract_keywords(text: str) -> List[str]:
    """Extract keywords from text for entity generation."""
    # Simple keyword extraction - split by spaces and filter
    words = text.split()
    # Filter out common words and short words
    keywords = [w for w in words if len(w) > 3 and w.lower() not in
                ['the', 'that', 'this', 'with', 'from', 'have', 'been', 'would']]
    return keywords[:5]  # Return top 5


def _generate_mock_entities(text: str, language: str) -> List[EntityOut]:
    """Generate mock entities from text."""
    keywords = _extract_keywords(text)
    entities = []

    entity_types = ["organization", "person", "location", "event", "concept"]
    weights = [0.9, 0.7, 0.85, 0.6, 0.75]

    for i, keyword in enumerate(keywords):
        entity = EntityOut(
            id=f"entity_{i}_{uuid.uuid4().hex[:8]}",
            name=keyword if language == "en" else f"كيان_{i}",
            name_en=keyword if language != "en" else None,
            type=entity_types[i % len(entity_types)],
            weight=weights[i % len(weights)]
        )
        entities.append(entity)

    return entities


def _match_scenario_type(text: str) -> Optional[str]:
    """Try to match text against known scenarios."""
    text_lower = text.lower()

    if any(word in text_lower for word in ['fuel', 'oil', 'price', 'petrol']):
        return "fuel_price"
    elif any(word in text_lower for word in ['kuwait', 'hashtag', 'twitter', 'social']):
        return "kuwait_hashtag"
    elif any(word in text_lower for word in ['telecom', 'telecom', 'price', 'plan']):
        return "telecom_price"

    return None


async def parse_scenario(input_data: ScenarioInput) -> ScenarioResponse:
    """Parse raw text into a scenario with extracted entities."""
    try:
        # Generate scenario ID
        scenario_id = f"scenario_{uuid.uuid4().hex[:12]}"

        # Detect language if auto
        language = input_data.language
        if language == "auto":
            language = _detect_language(input_data.raw_text)

        # Try to match known scenarios
        scenario_type = _match_scenario_type(input_data.raw_text)

        # Load seed entities or generate mock entities
        seed_entities = None
        if scenario_type:
            seed_entities = _load_seed_entities(scenario_type)

        if seed_entities:
            entities = [EntityOut(**e) for e in seed_entities]
        else:
            entities = _generate_mock_entities(input_data.raw_text, language)

        # Generate title if not provided
        title = input_data.title or f"Scenario {scenario_id[:8]}"

        return ScenarioResponse(
            id=scenario_id,
            title=title,
            raw_text=input_data.raw_text,
            language=language,
            country=input_data.country,
            category=input_data.category or scenario_type,
            created_at=datetime.utcnow(),
            entities=entities
        )

    except Exception as e:
        # Fallback: return minimal response with mock data
        scenario_id = f"scenario_{uuid.uuid4().hex[:12]}"
        return ScenarioResponse(
            id=scenario_id,
            title=input_data.title or "Scenario",
            raw_text=input_data.raw_text,
            language=input_data.language or "en",
            country=input_data.country,
            category=input_data.category,
            created_at=datetime.utcnow(),
            entities=[]
        )
