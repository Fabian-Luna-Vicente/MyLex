from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models.vocabulary import Word, VocabularyList
from app.schemas.vocabulary import WordCreate, WordUpdate, VocabularyListCreate, VocabularyListUpdate
from typing import List, Optional

class VocabularyRepository:
    def __init__(self, db: Session):
        self.db = db

    # --- Lists ---

    def create_list(self, user_id: str, list_in: VocabularyListCreate) -> VocabularyList:
        db_list = VocabularyList(user_id=user_id, name=list_in.name)
        self.db.add(db_list)
        self.db.commit()
        self.db.refresh(db_list)
        return db_list

    def get_list(self, list_id: int, user_id: str) -> Optional[VocabularyList]:
        return self.db.query(VocabularyList).filter(
            VocabularyList.id == list_id,
            VocabularyList.user_id == user_id
        ).first()

    def get_lists_by_user(self, user_id: str) -> List[VocabularyList]:
        return self.db.query(VocabularyList).filter(VocabularyList.user_id == user_id).all()

    def update_list(self, list_id: int, user_id: str, list_in: VocabularyListUpdate) -> Optional[VocabularyList]:
        db_list = self.get_list(list_id, user_id)
        if db_list:
            db_list.name = list_in.name
            self.db.commit()
            self.db.refresh(db_list)
        return db_list

    def delete_list(self, list_id: int, user_id: str) -> bool:
        db_list = self.get_list(list_id, user_id)
        if db_list:
            self.db.delete(db_list)
            self.db.commit()
            return True
        return False

    def get_lists_by_ids(self, list_ids: List[int], user_id: str) -> List[VocabularyList]:
        if not list_ids:
            return []
        return self.db.query(VocabularyList).filter(
            VocabularyList.id.in_(list_ids),
            VocabularyList.user_id == user_id
        ).all()

    # --- Words ---

    def create_word(self, user_id: str, word_in: WordCreate) -> Word:
        word_data = word_in.model_dump(exclude={"list_ids"})
        db_word = Word(**word_data, user_id=user_id)
        
        if word_in.list_ids:
            lists = self.get_lists_by_ids(word_in.list_ids, user_id)
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

    def update_word(self, word_id: int, user_id: str, word_in: WordUpdate) -> Optional[Word]:
        db_word = self.get_word(word_id, user_id)
        if not db_word:
            return None
            
        update_data = word_in.model_dump(exclude_unset=True, exclude={"list_ids"})
        for field, value in update_data.items():
            setattr(db_word, field, value)
            
        if word_in.list_ids is not None:
            lists = self.get_lists_by_ids(word_in.list_ids, user_id)
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
