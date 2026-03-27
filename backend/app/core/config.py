from pathlib import Path
from typing import Optional
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings."""

    app_name: str = "Deevo Sim API"
    app_version: str = "1.0.0"
    debug: bool = False

    # Paths
    backend_root: Path = Path(__file__).resolve().parent.parent.parent
    seeds_dir: Path = backend_root.parent / "seeds"

    class Config:
        env_file = ".env"


settings = Settings()
