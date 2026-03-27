from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import get_scenario_service
from app.schemas.scenario import NormalizedScenario, ScenarioNormalizeRequest
from app.services.scenario_service import ScenarioService

router = APIRouter(prefix="/scenario", tags=["scenario"])


@router.post(
    "/normalize",
    response_model=NormalizedScenario,
    status_code=status.HTTP_200_OK,
)
def normalize_scenario(
    payload: ScenarioNormalizeRequest,
    service: ScenarioService = Depends(get_scenario_service),
) -> NormalizedScenario:
    try:
        return service.normalize(payload)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to normalize scenario.",
        ) from exc
