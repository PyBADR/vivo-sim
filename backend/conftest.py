"""Root conftest — ensures 'backend/' is on sys.path for pytest discovery."""
from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
