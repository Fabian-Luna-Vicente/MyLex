from fastapi import APIRouter, Depends
from app.schemas.ai import DictionaryRequest, GrammarRequest, CorrectorRequest
from app.services.ai_service import AIService
from app.core.dependencies import get_current_user
from app.models.user import User

router = APIRouter()

def get_ai_service():
    return AIService()

@router.post("/dictionary/search")
async def search_dictionary(
    request: DictionaryRequest,
    current_user: User = Depends(get_current_user),
    ai_service: AIService = Depends(get_ai_service)
):
    """
    Search word definition using traditional dictionary or AI based on use_ai flag.
    """
    return await ai_service.search_dictionary(request)

@router.post("/grammar/analyze")
async def analyze_grammar(
    request: GrammarRequest,
    current_user: User = Depends(get_current_user),
    ai_service: AIService = Depends(get_ai_service)
):
    """
    Analyze grammatical structure of a sentence using AI.
    """
    return await ai_service.analyze_grammar(request)

@router.post("/corrector/assist")
async def assist_writing(
    request: CorrectorRequest,
    current_user: User = Depends(get_current_user),
    ai_service: AIService = Depends(get_ai_service)
):
    """
    Correct student's writing, verify target words usage and provide explanations.
    """
    return await ai_service.correct_text(request)
