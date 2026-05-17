from app.services.profile_service import ProfileService
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.services.progress_service import ProgressService
from app.schemas.vocabulary import ProgressUpsert, ProgressBulkUpsert, ProgressResponse, WordResponse
from fastapi import Request

router = APIRouter()

def get_progress_service(db: Session = Depends(get_db)):
    return ProgressService(db)

def get_profile_service(db: Session = Depends(get_db)):
    return ProfileService(db)
    
@router.get("/games/{list_id}/{game}", response_model=List[WordResponse])
def get_words_for_game(
    request: Request,
    list_id: int,
    game: str,
    current_user: User = Depends(get_current_user),
    service: ProgressService = Depends(get_progress_service)
):
    """
    Returns a prioritized list of words for a game session.
    Applies spaced-repetition logic based on past progress.
    
    - random: orders by difficulty cooldown, randomizes within groups, limits to 20
    - hangman: excludes words answered correctly less than 2 days ago
    """
    return service.get_words_for_game(current_user.id, list_id, game)


@router.post("/progress", response_model=ProgressResponse)
def save_single_progress(
    request: Request,
    item: ProgressUpsert,
    current_user: User = Depends(get_current_user),
    service: ProgressService = Depends(get_progress_service),
    profile_service: ProfileService = Depends(get_profile_service)
):
    result = service.save_progress(current_user.id, item)
    profile_service.update_user_streak(current_user.id)
    return result


@router.post("/progress/bulk")
def save_bulk_progress(
    request: Request,
    payload: ProgressBulkUpsert,
    current_user: User = Depends(get_current_user),
    service: ProgressService = Depends(get_progress_service),
    profile_service: ProfileService = Depends(get_profile_service)
):
    result = service.save_progress_bulk(current_user.id, payload)
    profile_service.update_user_streak(current_user.id)
    return result


@router.get("/progress/{list_id}", response_model=List[ProgressResponse])
def get_list_progress(
    request: Request,
    list_id: int,
    current_user: User = Depends(get_current_user),
    service: ProgressService = Depends(get_progress_service)
):
    """Returns all progress records for words in a list (for stats display)."""
    return service.get_list_progress(current_user.id, list_id)


@router.get("/stats/overall")
def get_overall_stats(
    request: Request,
    current_user: User = Depends(get_current_user),
    service: ProgressService = Depends(get_progress_service)
):
    """Summary stats for Dashboard."""
    return service.get_overall_stats(current_user.id)


@router.get("/stats/detailed",response_model=List[ProgressResponse])
def get_detailed_stats(
    request: Request,
    game: str = None,
    list_id: int = None,
    word_type: str = None,
    start_date: str = None,
    end_date: str = None,
    current_user: User = Depends(get_current_user),
    service: ProgressService = Depends(get_progress_service)
):
    """Detailed stats with filters for the Statistics page."""
    # Convert dates if present
    from datetime import datetime
    s_date = datetime.fromisoformat(start_date) if start_date else None
    e_date = datetime.fromisoformat(end_date) if end_date else None
    
    return service.get_detailed_stats(
        current_user.id, game, list_id, word_type, s_date, e_date
    )
