from fastapi import APIRouter, Depends
from app.schemas.ai import DictionaryRequest, GrammarRequest, CorrectorRequest, TranslationRequest
from app.services.ai_service import AIService
from app.core.dependencies import get_current_user
from app.models.user import User
from app.core.limiter import limiter
from fastapi import Request
from app.core.database import get_db

router = APIRouter()

def get_ai_service():
    return AIService()

@router.post("/dictionary/search")
@limiter.limit("10/minute")
async def search_dictionary(
    request: Request,
    data: DictionaryRequest,
    current_user: User = Depends(get_current_user),
    ai_service: AIService = Depends(get_ai_service),
    db: Session = Depends(get_db)
):
    """
    Search word definition using traditional dictionary or AI based on use_ai flag.
    """
    from app.services.usage_service import check_and_increment_limit
    
    # Simple heuristic: if context is provided, it's contextualized.
    if data.use_ai:
        if getattr(data, "context", None):
            check_and_increment_limit(db, current_user, "weekly_dict_context_words")
        else:
            check_and_increment_limit(db, current_user, "daily_dict_words")
            
    return await ai_service.search_dictionary(data, data.ai_language)

@router.post("/grammar/analyze")
@limiter.limit("15/minute")
async def analyze_grammar(
    request: Request,
    data: GrammarRequest,
    current_user: User = Depends(get_current_user),
    ai_service: AIService = Depends(get_ai_service),
    db: Session = Depends(get_db)
):
    """
    Analyze grammatical structure of a sentence using AI.
    """
    from app.services.usage_service import check_and_increment_limit
    check_and_increment_limit(db, current_user, "daily_grammar_analysis")
    return await ai_service.analyze_grammar(data, data.ai_language)

@router.post("/corrector/assist")
@limiter.limit("5/minute")
async def assist_writing(
    request: Request,
    data: CorrectorRequest,
    current_user: User = Depends(get_current_user),
    ai_service: AIService = Depends(get_ai_service),
    db: Session = Depends(get_db)
):
    """
    Correct student's writing, verify target words usage and provide explanations.
    """
    from app.services.usage_service import check_and_increment_limit
    check_and_increment_limit(db, current_user, "daily_writing_corrections")
    return await ai_service.correct_text(data, data.ai_language)

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
    return await ai_service.translate_text(data, data.ai_language)

