from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from app.models.profile import UserProfile, FriendRequest
from app.models.user import User
from app.models.vocabulary import VocabularyList, Word
from datetime import date, timedelta

class ProfileRepository:
    def __init__(self, db: Session):
        self.db = db

    # --- Profile CRUD ---

    def get_profile_by_user_id(self, user_id: str) -> UserProfile | None:
        return self.db.query(UserProfile).filter(UserProfile.user_id == user_id).first()

    def create_profile(self, user_id: str) -> UserProfile:
        profile = UserProfile(user_id=user_id)
        self.db.add(profile)
        self.db.commit()
        self.db.refresh(profile)
        return profile

    def get_or_create_profile(self, user_id: str) -> UserProfile:
        profile = self.get_profile_by_user_id(user_id)
        if not profile:
            profile = self.create_profile(user_id)
        return profile

    def update_profile(self, user_id: str, data: dict) -> UserProfile:
        profile = self.get_or_create_profile(user_id)
        for key, value in data.items():
            if value is not None and hasattr(profile, key):
                setattr(profile, key, value)
        self.db.commit()
        self.db.refresh(profile)
        return profile

    # --- Stats ---

    def get_user_word_count(self, user_id: str) -> int:
        return self.db.query(func.count(Word.id)).filter(Word.user_id == user_id).scalar() or 0

    def get_user_list_count(self, user_id: str) -> int:
        return self.db.query(func.count(VocabularyList.id)).filter(VocabularyList.user_id == user_id).scalar() or 0

    # --- Friend Requests ---

    def get_friend_request(self, sender_id: str, receiver_id: str) -> FriendRequest | None:
        return self.db.query(FriendRequest).filter(
            FriendRequest.sender_id == sender_id,
            FriendRequest.receiver_id == receiver_id
        ).first()

    def get_friend_request_by_id(self, request_id: int) -> FriendRequest | None:
        return self.db.query(FriendRequest).filter(FriendRequest.id == request_id).first()

    def get_existing_request(self, user_a: str, user_b: str) -> FriendRequest | None:
        return self.db.query(FriendRequest).filter(
            or_(
                (FriendRequest.sender_id == user_a) & (FriendRequest.receiver_id == user_b),
                (FriendRequest.sender_id == user_b) & (FriendRequest.receiver_id == user_a),
            )
        ).first()

    def create_friend_request(self, sender_id: str, receiver_id: str) -> FriendRequest:
        request = FriendRequest(sender_id=sender_id, receiver_id=receiver_id, status="pending")
        self.db.add(request)
        self.db.commit()
        self.db.refresh(request)
        return request

    def update_request_status(self, request_id: int, status: str) -> FriendRequest:
        request = self.get_friend_request_by_id(request_id)
        if request:
            request.status = status
            self.db.commit()
            self.db.refresh(request)
        return request

    def get_pending_requests_for_user(self, user_id: str) -> list:
        return self.db.query(FriendRequest).filter(
            FriendRequest.receiver_id == user_id,
            FriendRequest.status == "pending"
        ).all()

    def get_sent_requests(self, user_id: str) -> list:
        return self.db.query(FriendRequest).filter(
            FriendRequest.sender_id == user_id,
            FriendRequest.status == "pending"
        ).all()

    def get_friends(self, user_id: str) -> list[str]:
        accepted = self.db.query(FriendRequest).filter(
            FriendRequest.status == "accepted",
            or_(
                FriendRequest.sender_id == user_id,
                FriendRequest.receiver_id == user_id
            )
        ).all()

        friend_ids = []
        for req in accepted:
            if req.sender_id == user_id:
                friend_ids.append(req.receiver_id)
            else:
                friend_ids.append(req.sender_id)
        return friend_ids

    def get_friend_count(self, user_id: str) -> int:
        return self.db.query(func.count(FriendRequest.id)).filter(
            FriendRequest.status == "accepted",
            or_(
                FriendRequest.sender_id == user_id,
                FriendRequest.receiver_id == user_id
            )
        ).scalar() or 0

    def are_friends(self, user_a: str, user_b: str) -> bool:
        req = self.get_existing_request(user_a, user_b)
        return req is not None and req.status == "accepted"

    def get_request_status(self, user_a: str, user_b: str) -> str | None:
        req = self.get_existing_request(user_a, user_b)
        return req.status if req else None

    def delete_friend(self, user_a: str, user_b: str) -> bool:
        req = self.get_existing_request(user_a, user_b)
        if req and req.status == "accepted":
            self.db.delete(req)
            self.db.commit()
            return True
        return False

    # --- Search ---

    def search_users(self, query: str, current_user_id: str, limit: int = 20) -> list:
        return self.db.query(User).filter(
            User.id != current_user_id,
            or_(
                User.name.ilike(f"%{query}%"),
                User.email.ilike(f"%{query}%")
            )
        ).limit(limit).all()

    def get_user_by_id(self, user_id: str) -> User | None:
        return self.db.query(User).filter(User.id == user_id).first()

    def update_streak(self, user_id: str) -> UserProfile:
        profile = self.get_or_create_profile(user_id)
        today = date.today()

        if profile.last_activity_date == today:
            return profile

        if profile.last_activity_date == today - timedelta(days=1):
            profile.current_streak = (profile.current_streak or 0) + 1
        else:
            profile.current_streak = 1

        if profile.current_streak > (profile.longest_streak or 0):
            profile.longest_streak = profile.current_streak

        profile.last_activity_date = today
        
        self.db.commit()
        self.db.refresh(profile)
        return profile