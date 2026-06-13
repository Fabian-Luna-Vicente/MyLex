from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.services.list_service import ListService
from app.services.word_service import WordService
from app.repositories.list_repository import ListRepository
from app.repositories.word_repository import WordRepository
from app.repositories.profile_repository import ProfileRepository
from app.schemas.vocabulary import (
    WordCreate, WordUpdate, WordResponse,
    VocabularyListCreate, VocabularyListUpdate, VocabularyListResponse, VocabularyListBasic
)
from fastapi import Request
import httpx
from fastapi.responses import StreamingResponse

router = APIRouter()

def get_list_service(db: Session = Depends(get_db)):
    list_repo = ListRepository(db)
    profile_repo = ProfileRepository(db)
    return ListService(list_repo, profile_repo)

def get_word_service(db: Session = Depends(get_db)):
    word_repo = WordRepository(db)
    list_repo = ListRepository(db)
    return WordService(word_repo, list_repo)

# --- Lists Endpoints ---

@router.post("/lists", response_model=VocabularyListBasic)
def create_list(
    request: Request,
    list_in: VocabularyListCreate,
    current_user: User = Depends(get_current_user),
    list_service: ListService = Depends(get_list_service)
):
    from app.core.config_limits import get_user_limit
    limit = get_user_limit(current_user.subscription_tier, "max_lists")
    if limit != -1:
        current_lists = list_service.get_lists(current_user.id)
        if len(current_lists) >= limit:
            from fastapi import HTTPException, status
            raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail=f"Has alcanzado el límite de {limit} listas de tu plan.")
            
    return list_service.create_list(current_user.id, list_in)

@router.get("/lists", response_model=List[VocabularyListBasic])
def get_lists(
    request: Request,
    current_user: User = Depends(get_current_user),
    list_service: ListService = Depends(get_list_service)
):
    return list_service.get_lists(current_user.id)

@router.get("/users/{user_id}/lists", response_model=List[VocabularyListBasic])
def get_user_lists(
    request: Request,
    user_id: str,
    current_user: User = Depends(get_current_user),
    list_service: ListService = Depends(get_list_service)
):
    return list_service.get_user_lists_with_privacy(user_id, current_user.id)

@router.get("/lists/{list_id}", response_model=VocabularyListResponse)
def get_list(
    request: Request,
    list_id: int,
    current_user: User = Depends(get_current_user),
    list_service: ListService = Depends(get_list_service)
):
    db_list = list_service.get_list(list_id, current_user.id)
    if not db_list:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="List not found")
    return db_list

@router.put("/lists/{list_id}", response_model=VocabularyListBasic)
def update_list(
    request: Request,
    list_id: int,
    list_in: VocabularyListUpdate,
    current_user: User = Depends(get_current_user),
    list_service: ListService = Depends(get_list_service)
):
    db_list = list_service.update_list(list_id, current_user.id, list_in)
    if not db_list:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="List not found")
    return db_list

@router.delete("/lists/{list_id}")
def delete_list(
    request: Request,
    list_id: int,
    current_user: User = Depends(get_current_user),
    list_service: ListService = Depends(get_list_service)
):
    success = list_service.delete_list(list_id, current_user.id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="List not found")
    return {"detail": "List deleted successfully"}

@router.post("/lists/{list_id}/copy", response_model=VocabularyListBasic)
def copy_list(
    request: Request,
    list_id: int,
    current_user: User = Depends(get_current_user),
    list_service: ListService = Depends(get_list_service)
):
    new_list = list_service.copy_list(list_id, current_user.id)
    if not new_list:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="List not found or cannot be copied")
    return new_list


# --- Words Endpoints ---

@router.post("/words", response_model=WordResponse)
def create_word(
    request: Request,
    word_in: WordCreate,
    current_user: User = Depends(get_current_user),
    word_service: WordService = Depends(get_word_service)
):
    from app.core.config_limits import get_user_limit
    limit = get_user_limit(current_user.subscription_tier, "max_words_per_list")
    if limit != -1:
        # Get current words in the list to check the limit
        # This requires fetching the list's words count. We can do len(get_words_by_list) but WordService might not have it directly.
        # Actually, words belong to a list. Let's just check all words? No, the limit is PER LIST.
        # Let's check how many words are in the list.
        # word_in.list_id is the list ID.
        db_list = word_service.list_repo.get_list_by_id(word_in.list_id)
        if db_list:
            if len(db_list.words) >= limit:
                from fastapi import HTTPException, status
                raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail=f"Has alcanzado el límite de {limit} palabras por lista.")

    return word_service.create_word(current_user.id, word_in)

@router.get("/words", response_model=List[WordResponse])
def get_words(
    request: Request,
    search: Optional[str] = Query(None, description="Search term for word name or meaning"),
    current_user: User = Depends(get_current_user),
    word_service: WordService = Depends(get_word_service)
):
    return word_service.get_words(current_user.id, search)

@router.get("/words/{word_id}", response_model=WordResponse)
def get_word(
    request: Request,
    word_id: int,
    current_user: User = Depends(get_current_user),
    word_service: WordService = Depends(get_word_service)
):
    db_word = word_service.get_word(word_id, current_user.id)
    if not db_word:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Word not found")
    return db_word

@router.put("/words/{word_id}", response_model=WordResponse)
def update_word(
    request: Request,
    word_id: int,
    word_in: WordUpdate,
    current_user: User = Depends(get_current_user),
    word_service: WordService = Depends(get_word_service)
):
    db_word = word_service.update_word(word_id, current_user.id, word_in)
    if not db_word:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Word not found")
    return db_word

@router.delete("/words/{word_id}")
def delete_word(
    request: Request,
    word_id: int,
    current_user: User = Depends(get_current_user),
    word_service: WordService = Depends(get_word_service)
):
    success = word_service.delete_word(word_id, current_user.id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Word not found")
    return {"detail": "Word deleted successfully"}

# --- TTS Proxy Endpoint ---

@router.get("/tts")
async def get_tts(
    text: str,
    lang: str,
    request: Request
):
    import urllib.parse
    url = f"https://translate.googleapis.com/translate_tts?client=gtx&ie=UTF-8&tl={lang}&q={urllib.parse.quote(text)}"
    
    async def stream():
        async with httpx.AsyncClient() as client:
            async with client.stream("GET", url) as response:
                if response.status_code != 200:
                    yield b""
                    return
                async for chunk in response.aiter_bytes():
                    yield chunk
                    
    return StreamingResponse(stream(), media_type="audio/mpeg")
