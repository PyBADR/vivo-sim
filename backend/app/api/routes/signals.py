from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import get_signal_service
from app.schemas.signal import SignalExtractionRequest, SignalExtractionResponse
from app.services.signal_service import SignalService

router = APIRouter(prefix="/signals", tags=["signals"])


@router.post(
    "/extract",
    response_model=SignalExtractionResponse,
    status_code=status.HTTP_200_OK,
)
def extract_signals(
    payload: SignalExtractionRequest,
    service: SignalService = Depends(get_signal_service),
) -> SignalExtractionResponse:
    try:
        return service.extract(payload)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to extract signals.",
        ) from exc
