from app.core.exceptions import ResourceNotFoundError, ValidationError
from sqlalchemy.orm import Session
from app.repositories.progress_repository import ProgressRepository
from app.schemas.vocabulary import ProgressUpsert, ProgressBulkUpsert
from typing import List
from datetime import date, timedelta

class ProgressService:
    def __init__(self, db: Session):
        self.repo = ProgressRepository(db)

    def save_progress(self, user_id: str, item: ProgressUpsert):
        """Upsert a single progress record. Validates game/difficulty combos."""
        if item.game == "random" and item.difficulty not in ("easy", "normal", "hard", "ultrahard", None):
            raise ValidationError(f"Invalid difficulty '{item.difficulty}' for random game.")
        return self.repo.upsert_progress(user_id, item)

    def save_progress_bulk(self, user_id: str, payload: ProgressBulkUpsert) -> dict:
        count = self.repo.bulk_upsert_progress(user_id, payload.items)
        return {"detail": f"{count} progress records saved."}

    def get_words_for_game(self, user_id: str, list_id: int, game: str):
        words = self.repo.get_words_for_game(user_id, list_id, game)
        if not words:
            raise ResourceNotFoundError("No words available for this game in the selected list.")
        return words

    def get_list_progress(self, user_id: str, list_id: int):
        return self.repo.get_progress_for_list(user_id, list_id)

    def get_overall_stats(self, user_id: str):
        return self.repo.get_overall_stats(user_id)

    def get_detailed_stats(
        self, 
        user_id: str, 
        game: str = None, 
        list_id: int = None, 
        word_type: str = None,
        start_date=None,
        end_date=None
    ):
        return self.repo.get_detailed_stats(
            user_id, game, list_id, word_type, start_date, end_date
        )
