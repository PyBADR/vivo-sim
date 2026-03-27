from fastapi import APIRouter

from app.api.routes import (
    analysis_router,
    brief_router,
    decision_router,
    graph_router,
    scenario_router,
    scenarios_router,
    signals_router,
    simulate_router,
)

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(scenario_router)
api_router.include_router(scenarios_router)
api_router.include_router(signals_router)
api_router.include_router(graph_router)
api_router.include_router(simulate_router)
api_router.include_router(decision_router)
api_router.include_router(brief_router)
api_router.include_router(analysis_router)
