from app.api.routes.analysis import router as analysis_router
from app.api.routes.brief import router as brief_router
from app.api.routes.decision import router as decision_router
from app.api.routes.decision_intelligence import router as decision_intelligence_router
from app.api.routes.graph import router as graph_router
from app.api.routes.scenario import router as scenario_router
from app.api.routes.scenarios import router as scenarios_router
from app.api.routes.signals import router as signals_router
from app.api.routes.simulate import router as simulate_router

__all__ = [
    "analysis_router",
    "brief_router",
    "decision_router",
    "decision_intelligence_router",
    "graph_router",
    "scenario_router",
    "scenarios_router",
    "signals_router",
    "simulate_router",
]
