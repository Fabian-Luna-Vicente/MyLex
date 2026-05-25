from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models.vocabulary import Word, VocabularyList
from app.schemas.vocabulary import WordCreate, WordUpdate
from typing import List, Optional

class WordRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_word(self, user_id: str, word_in: WordCreate, lists: List[VocabularyList] = None) -> Word:
        word_data = word_in.model_dump(exclude={"list_ids"})
        db_word = Word(**word_data, user_id=user_id)
        
        if lists is not None:
            db_word.lists = lists
            
        self.db.add(db_word)
        self.db.commit()
        self.db.refresh(db_word)
        return db_word

    def get_word(self, word_id: int, user_id: str) -> Optional[Word]:
        return self.db.query(Word).filter(Word.id == word_id, Word.user_id == user_id).first()

    def get_words_by_user(self, user_id: str, search: str = None) -> List[Word]:
        query = self.db.query(Word).filter(Word.user_id == user_id)
        if search:
            search_pattern = f"%{search}%"
            query = query.filter(
                or_(
                    Word.name.ilike(search_pattern),
                    Word.meaning.ilike(search_pattern)
                )
            )
        return query.all()

    def update_word(self, word_id: int, user_id: str, word_in: WordUpdate, lists: List[VocabularyList] = None) -> Optional[Word]:
        db_word = self.get_word(word_id, user_id)
        if not db_word:
            return None
            
        update_data = word_in.model_dump(exclude_unset=True, exclude={"list_ids"})
        for field, value in update_data.items():
            setattr(db_word, field, value)
            
        if word_in.list_ids is not None and lists is not None:
            db_word.lists = lists
            
        self.db.commit()
        self.db.refresh(db_word)
        return db_word

    def delete_word(self, word_id: int, user_id: str) -> bool:
        db_word = self.get_word(word_id, user_id)
        if db_word:
            self.db.delete(db_word)
            self.db.commit()
            return True
        return False
