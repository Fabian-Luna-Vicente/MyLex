from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models.vocabulary import VocabularyList, PrivacyLevel
from app.schemas.vocabulary import VocabularyListCreate, VocabularyListUpdate
from typing import List, Optional

class ListRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_list(self, user_id: str, list_in: VocabularyListCreate) -> VocabularyList:
        list_data = list_in.model_dump()
        db_list = VocabularyList(user_id=user_id, **list_data)
        self.db.add(db_list)
        self.db.commit()
        self.db.refresh(db_list)
        return db_list

    def get_list(self, list_id: int, user_id: str) -> Optional[VocabularyList]:
        return self.db.query(VocabularyList).filter(
            VocabularyList.id == list_id,
            VocabularyList.user_id == user_id
        ).first()

    def get_list_with_privacy_check(self, list_id: int, current_user_id: str) -> Optional[VocabularyList]:
        db_list = self.db.query(VocabularyList).filter(VocabularyList.id == list_id).first()
        if not db_list:
            return None
            
        if db_list.user_id == current_user_id:
            return db_list
            
        if db_list.privacy == PrivacyLevel.PRIVATE.value:
            return None
            
        if db_list.privacy == PrivacyLevel.FRIENDS.value:
            from app.repositories.profile_repository import ProfileRepository
            profile_repo = ProfileRepository(self.db)
            if not profile_repo.are_friends(db_list.user_id, current_user_id):
                return None
                
        return db_list

    def get_lists_by_user(self, user_id: str) -> List[VocabularyList]:
        return self.db.query(VocabularyList).filter(VocabularyList.user_id == user_id).all()

    def get_user_lists_with_privacy(self, target_user_id: str, is_friend: bool, is_self: bool) -> List[VocabularyList]:
        query = self.db.query(VocabularyList).filter(VocabularyList.user_id == target_user_id)
        if is_self:
            return query.all()
        if is_friend:
            return query.filter(VocabularyList.privacy.in_([PrivacyLevel.PUBLIC.value, PrivacyLevel.FRIENDS.value])).all()
        return query.filter(VocabularyList.privacy == PrivacyLevel.PUBLIC.value).all()

    def update_list(self, list_id: int, user_id: str, list_in: VocabularyListUpdate) -> Optional[VocabularyList]:
        db_list = self.get_list(list_id, user_id)
        if db_list:
            update_data = list_in.model_dump(exclude_unset=True)
            for field, value in update_data.items():
                setattr(db_list, field, value)
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
