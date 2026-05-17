from fastapi import APIRouter, Depends
from app.schemas.ai import DictionaryRequest, GrammarRequest, CorrectorRequest, TranslationRequest
from app.services.ai_service import AIService
from app.core.dependencies import get_current_user
from app.models.user import User
from app.core.limiter import limiter
from fastapi import Request

router = APIRouter()

def get_ai_service():
    return AIService()

@router.post("/dictionary/search")
@limiter.limit("10/minute")
async def search_dictionary(
    request: Request,
    data: DictionaryRequest,
    current_user: User = Depends(get_current_user),
    ai_service: AIService = Depends(get_ai_service)
):
    """
    Search word definition using traditional dictionary or AI based on use_ai flag.
    """
    return await ai_service.search_dictionary(data)

@router.post("/grammar/analyze")
@limiter.limit("15/minute")
async def analyze_grammar(
    request: Request,
    data: GrammarRequest,
    current_user: User = Depends(get_current_user),
    ai_service: AIService = Depends(get_ai_service)
):
    """
    Analyze grammatical structure of a sentence using AI.
    """
    return await ai_service.analyze_grammar(data)

@router.post("/corrector/assist")
@limiter.limit("5/minute")
async def assist_writing(
    request: Request,
    data: CorrectorRequest,
    current_user: User = Depends(get_current_user),
    ai_service: AIService = Depends(get_ai_service)
):
    """
    Correct student's writing, verify target words usage and provide explanations.
    """
    return await ai_service.correct_text(data)

@router.post("/translate")
@limiter.limit("10/minute")
async def translate_text(
    request: Request,
    data: TranslationRequest,
    current_user: User = Depends(get_current_user),
    ai_service: AIService = Depends(get_ai_service)
):
    """
    Translate text using AI.
    """
    return await ai_service.translate_text(data)

