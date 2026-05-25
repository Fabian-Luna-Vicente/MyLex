from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.services.vocabulary_service import VocabularyService
from app.schemas.vocabulary import (
    WordCreate, WordUpdate, WordResponse,
    VocabularyListCreate, VocabularyListUpdate, VocabularyListResponse, VocabularyListBasic
)
from fastapi import Request

router = APIRouter()

def get_vocab_service(db: Session = Depends(get_db)):
    return VocabularyService(db)

# --- Lists Endpoints ---

@router.post("/lists", response_model=VocabularyListBasic)
def create_list(
    request: Request,
    list_in: VocabularyListCreate,
    current_user: User = Depends(get_current_user),
    vocab_service: VocabularyService = Depends(get_vocab_service)
):
    return vocab_service.create_list(current_user.id, list_in)

@router.get("/lists", response_model=List[VocabularyListBasic])
def get_lists(
    request: Request,
    current_user: User = Depends(get_current_user),
    vocab_service: VocabularyService = Depends(get_vocab_service)
):
    return vocab_service.get_lists(current_user.id)

@router.get("/users/{user_id}/lists", response_model=List[VocabularyListBasic])
def get_user_lists(
    request: Request,
    user_id: str,
    current_user: User = Depends(get_current_user),
    vocab_service: VocabularyService = Depends(get_vocab_service)
):
    return vocab_service.get_user_lists_with_privacy(user_id, current_user.id)

@router.get("/lists/{list_id}", response_model=VocabularyListResponse)
def get_list(
    request: Request,
    list_id: int,
    current_user: User = Depends(get_current_user),
    vocab_service: VocabularyService = Depends(get_vocab_service)
):
    return vocab_service.get_list(list_id, current_user.id)

@router.put("/lists/{list_id}", response_model=VocabularyListBasic)
def update_list(
    request: Request,
    list_id: int,
    list_in: VocabularyListUpdate,
    current_user: User = Depends(get_current_user),
    vocab_service: VocabularyService = Depends(get_vocab_service)
):
    return vocab_service.update_list(list_id, current_user.id, list_in)

@router.delete("/lists/{list_id}")
def delete_list(
    request: Request,
    list_id: int,
    current_user: User = Depends(get_current_user),
    vocab_service: VocabularyService = Depends(get_vocab_service)
):
    return vocab_service.delete_list(list_id, current_user.id)


# --- Words Endpoints ---

@router.post("/words", response_model=WordResponse)
def create_word(
    request: Request,
    word_in: WordCreate,
    current_user: User = Depends(get_current_user),
    vocab_service: VocabularyService = Depends(get_vocab_service)
):
    return vocab_service.create_word(current_user.id, word_in)

@router.get("/words", response_model=List[WordResponse])
def get_words(
    request: Request,
    search: Optional[str] = Query(None, description="Search term for word name or meaning"),
    current_user: User = Depends(get_current_user),
    vocab_service: VocabularyService = Depends(get_vocab_service)
):
    return vocab_service.get_words(current_user.id, search)

@router.get("/words/{word_id}", response_model=WordResponse)
def get_word(
    request: Request,
    word_id: int,
    current_user: User = Depends(get_current_user),
    vocab_service: VocabularyService = Depends(get_vocab_service)
):
    return vocab_service.get_word(word_id, current_user.id)

@router.put("/words/{word_id}", response_model=WordResponse)
def update_word(
    request: Request,
    word_id: int,
    word_in: WordUpdate,
    current_user: User = Depends(get_current_user),
    vocab_service: VocabularyService = Depends(get_vocab_service)
):
    return vocab_service.update_word(word_id, current_user.id, word_in)

@router.delete("/words/{word_id}")
def delete_word(
    request: Request,
    word_id: int,
    current_user: User = Depends(get_current_user),
    vocab_service: VocabularyService = Depends(get_vocab_service)
):
    return vocab_service.delete_word(word_id, current_user.id)
