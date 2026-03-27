from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import get_brief_service, get_brief_service_v2
from app.schemas.branching import BranchEnvelope
from app.schemas.branched_requests import BranchedBriefRequest
from app.schemas.brief import BriefGenerateRequest, IntelligenceBrief
from app.schemas.intervention import InterventionSet
from app.schemas.uncertainty import UncertaintyEnvelope
from app.services.brief_service import BriefService
from app.services.brief_service_v2 import BriefServiceV2

router = APIRouter(prefix="/brief", tags=["brief"])


@router.post(
    "/generate",
    response_model=IntelligenceBrief,
    status_code=status.HTTP_200_OK,
)
def generate_brief(
    payload: BriefGenerateRequest,
    service: BriefService = Depends(get_brief_service),
) -> IntelligenceBrief:
    try:
        return service.generate(payload)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate intelligence brief.",
        ) from exc


@router.post(
    "/generate-branched",
    response_model=dict,
    status_code=status.HTTP_200_OK,
)
def generate_branched_brief(
    req: BranchedBriefRequest,
    service: BriefServiceV2 = Depends(get_brief_service_v2),
) -> dict:
    try:
        # Reconstruct typed objects from dicts if present
        branch_env = BranchEnvelope(**req.branch_envelope) if req.branch_envelope else None
        intv_set = InterventionSet(**req.intervention_set) if req.intervention_set else None
        unc_env = UncertaintyEnvelope(**req.uncertainty_envelope) if req.uncertainty_envelope else None

        # Build v1-compatible payload for the service
        payload = BriefGenerateRequest(
            scenario_id=req.scenario_id,
            decision_output=req.decision_output,
            simulation_response=req.simulation_response,
            signals=req.signals,
        )

        # Call v2 service
        result = service.generate_branched(
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
            detail="Failed to generate branched intelligence brief.",
        ) from exc
