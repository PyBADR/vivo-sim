from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import get_decision_service, get_decision_service_v2
from app.schemas.branching import BranchEnvelope
from app.schemas.branched_requests import BranchedDecisionRequest
from app.schemas.decision import DecisionComputeRequest, DecisionOutput
from app.schemas.intervention import InterventionSet
from app.schemas.uncertainty import UncertaintyEnvelope
from app.services.decision_service import DecisionService
from app.services.decision_service_v2 import DecisionServiceV2

router = APIRouter(prefix="/decision", tags=["decision"])


@router.post(
    "/compute",
    response_model=DecisionOutput,
    status_code=status.HTTP_200_OK,
)
def compute_decision(
    payload: DecisionComputeRequest,
    service: DecisionService = Depends(get_decision_service),
) -> DecisionOutput:
    try:
        return service.compute(payload)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to compute decision output.",
        ) from exc


@router.post(
    "/compute-branched",
    response_model=dict,
    status_code=status.HTTP_200_OK,
)
def compute_branched_decision(
    req: BranchedDecisionRequest,
    service: DecisionServiceV2 = Depends(get_decision_service_v2),
) -> dict:
    try:
        # Reconstruct typed objects from dicts if present
        branch_env = BranchEnvelope(**req.branch_envelope) if req.branch_envelope else None
        intv_set = InterventionSet(**req.intervention_set) if req.intervention_set else None
        unc_env = UncertaintyEnvelope(**req.uncertainty_envelope) if req.uncertainty_envelope else None

        # Build v1-compatible payload for the service
        payload = DecisionComputeRequest(
            scenario_id=req.scenario_id,
            simulation_response=req.simulation_response,
        )

        # Call v2 service
        result = service.compute_branched(
            payload,
            branch_env,
            intv_set,
            unc_env,
        )

        # Serialize — result is a dict with mixed Pydantic models
        serialized = {}
        for k, v in result.items():
            if hasattr(v, "model_dump"):
                serialized[k] = v.model_dump()
            elif isinstance(v, list):
                serialized[k] = [
                    item.model_dump() if hasattr(item, "model_dump") else item
                    for item in v
                ]
            else:
                serialized[k] = v
        return serialized
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to compute branched decision output.",
        ) from exc
