from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import get_simulation_service, get_simulation_service_v2
from app.schemas.simulation import SimulationRunRequest, SimulationRunResponse
from app.services.simulation_service import SimulationService
from app.services.simulation_service_v2 import SimulationServiceV2

router = APIRouter(prefix="/simulate", tags=["simulate"])


@router.post(
    "/run",
    response_model=SimulationRunResponse,
    status_code=status.HTTP_200_OK,
)
def run_simulation(
    payload: SimulationRunRequest,
    service: SimulationService = Depends(get_simulation_service),
) -> SimulationRunResponse:
    try:
        return service.run(payload)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to run simulation.",
        ) from exc


@router.post(
    "/run-branched",
    status_code=status.HTTP_200_OK,
    summary="Phase 2D branched simulation with uncertainty and interventions",
)
def run_branched_simulation(
    payload: SimulationRunRequest,
    service: SimulationServiceV2 = Depends(get_simulation_service_v2),
):
    """Run Phase 2D multi-branch simulation.

    Returns:
    - baseline_response: standard SimulationRunResponse
    - branch_envelope: BranchEnvelope with 4 scenario branches
    - propagation_state: PropagationState with trajectories and energy
    - uncertainty_envelope: UncertaintyEnvelope with stage-level uncertainty
    - intervention_set: InterventionSet with ranked intervention options
    """
    try:
        result = service.run_branched(payload)
        # Serialize Pydantic models for JSON response
        return {
            "baseline_response": result["baseline_response"].model_dump(),
            "branch_envelope": result["branch_envelope"].model_dump(),
            "propagation_state": result["propagation_state"].model_dump(),
            "uncertainty_envelope": result["uncertainty_envelope"].model_dump(),
            "intervention_set": result["intervention_set"].model_dump(),
        }
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to run branched simulation: {exc}",
        ) from exc
