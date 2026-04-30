from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.repositories.vocabulary_repository import VocabularyRepository
from app.schemas.vocabulary import WordCreate, WordUpdate, VocabularyListCreate, VocabularyListUpdate

class VocabularyService:
    def __init__(self, db: Session):
        self.repo = VocabularyRepository(db)

    # --- Lists ---

    def create_list(self, user_id: str, list_in: VocabularyListCreate):
        return self.repo.create_list(user_id, list_in)

    def get_lists(self, user_id: str):
        return self.repo.get_lists_by_user(user_id)

    def get_list(self, list_id: int, user_id: str):
        db_list = self.repo.get_list(list_id, user_id)
        if not db_list:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="List not found")
        return db_list

    def update_list(self, list_id: int, user_id: str, list_in: VocabularyListUpdate):
        db_list = self.repo.update_list(list_id, user_id, list_in)
        if not db_list:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="List not found")
        return db_list

    def delete_list(self, list_id: int, user_id: str):
        success = self.repo.delete_list(list_id, user_id)
        if not success:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="List not found")
        return {"detail": "List deleted successfully"}

    # --- Words ---

    def create_word(self, user_id: str, word_in: WordCreate):
        return self.repo.create_word(user_id, word_in)

    def get_words(self, user_id: str, search: str = None):
        return self.repo.get_words_by_user(user_id, search)

    def get_word(self, word_id: int, user_id: str):
        db_word = self.repo.get_word(word_id, user_id)
        if not db_word:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Word not found")
        return db_word

    def update_word(self, word_id: int, user_id: str, word_in: WordUpdate):
        db_word = self.repo.update_word(word_id, user_id, word_in)
        if not db_word:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Word not found")
        return db_word

    def delete_word(self, word_id: int, user_id: str):
        success = self.repo.delete_word(word_id, user_id)
        if not success:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Word not found")
        return {"detail": "Word deleted successfully"}
