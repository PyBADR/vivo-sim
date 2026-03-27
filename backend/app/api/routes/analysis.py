from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import get_analysis_service, get_analysis_service_v2
from app.schemas.analysis import AnalysisQueryRequest, AnalysisQueryResponse
from app.schemas.branching import BranchEnvelope
from app.schemas.branched_requests import BranchedAnalysisRequest
from app.schemas.intervention import InterventionSet
from app.schemas.uncertainty import UncertaintyEnvelope
from app.services.analysis_service import AnalysisService
from app.services.analysis_service_v2 import AnalysisServiceV2

router = APIRouter(prefix="/analysis", tags=["analysis"])


@router.post(
    "/query",
    response_model=AnalysisQueryResponse,
    status_code=status.HTTP_200_OK,
)
def query_analysis(
    payload: AnalysisQueryRequest,
    service: AnalysisService = Depends(get_analysis_service),
) -> AnalysisQueryResponse:
    try:
        return service.answer(payload)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to answer analysis query.",
        ) from exc


@router.post(
    "/query-branched",
    response_model=dict,
    status_code=status.HTTP_200_OK,
)
def query_branched_analysis(
    req: BranchedAnalysisRequest,
    service: AnalysisServiceV2 = Depends(get_analysis_service_v2),
) -> dict:
    try:
        # Reconstruct typed objects from dicts if present
        branch_env = BranchEnvelope(**req.branch_envelope) if req.branch_envelope else None
        intv_set = InterventionSet(**req.intervention_set) if req.intervention_set else None
        unc_env = UncertaintyEnvelope(**req.uncertainty_envelope) if req.uncertainty_envelope else None

        # Build v1-compatible payload for the service
        payload = AnalysisQueryRequest(
            scenario_id=req.scenario_id,
            question=req.question,
            decision_output=req.decision_output,
            intelligence_brief=req.intelligence_brief,
            simulation_response=req.simulation_response,
        )

        # Call v2 service
        result = service.answer_branched(
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
            detail="Failed to answer branched analysis query.",
        ) from exc
