import uuid
from datetime import datetime
from pathlib import Path


def generate_id(prefix: str = "id") -> str:
    """Generate a unique ID with the given prefix."""
    return f"{prefix}_{uuid.uuid4().hex[:12]}"


def get_timestamp() -> datetime:
    """Get current UTC timestamp."""
    return datetime.utcnow()


def get_seeds_directory() -> Path:
    """Get the seeds directory path relative to backend root."""
    backend_dir = Path(__file__).resolve().parent.parent.parent
    return backend_dir.parent / "seeds"


def is_arabic_text(text: str) -> bool:
    """Check if text contains Arabic characters."""
    for char in text:
        if '\u0600' <= char <= '\u06FF':
            return True
    return False


def extract_keywords(text: str, max_count: int = 5) -> list[str]:
    """Extract keywords from text, filtering common words."""
    common_words = {
        'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
        'of', 'with', 'from', 'have', 'has', 'is', 'are', 'was', 'were',
        'been', 'be', 'would', 'could', 'should', 'may', 'might', 'must',
        'can', 'this', 'that', 'these', 'those', 'which', 'who', 'what',
        'when', 'where', 'why', 'how'
    }

    words = text.split()
    keywords = [
        w for w in words
        if len(w) > 3 and w.lower() not in common_words
    ]
    return keywords[:max_count]
