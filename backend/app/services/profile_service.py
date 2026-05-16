from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.repositories.profile_repository import ProfileRepository
from app.schemas.profile import (
    ProfileUpdate, ProfilePublic, FriendRequestOut, FriendOut, UserSearchResult
)


class ProfileService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = ProfileRepository(db)

    def get_my_profile(self, user_id: str) -> ProfilePublic:
        user = self.repo.get_user_by_id(user_id)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

        profile = self.repo.get_or_create_profile(user_id)
        return ProfilePublic(
            user_id=user.id,
            username=user.name,
            bio=profile.bio or "",
            avatar_url=profile.avatar_url or "",
            country=profile.country or "",
            native_language=profile.native_language or "",
            learning_languages=profile.learning_languages or [],
            level=profile.level or "Beginner",
            created_at=user.created_at,
            total_words=self.repo.get_user_word_count(user_id),
            total_lists=self.repo.get_user_list_count(user_id),
            friend_count=self.repo.get_friend_count(user_id),
            is_friend=False,
            request_status=None
        )

    def get_public_profile(self, target_user_id: str, current_user_id: str) -> ProfilePublic:
        user = self.repo.get_user_by_id(target_user_id)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

        profile = self.repo.get_or_create_profile(target_user_id)
        is_friend = self.repo.are_friends(current_user_id, target_user_id)
        request_status = self.repo.get_request_status(current_user_id, target_user_id)

        return ProfilePublic(
            user_id=user.id,
            username=user.name,
            bio=profile.bio or "",
            avatar_url=profile.avatar_url or "",
            country=profile.country or "",
            native_language=profile.native_language or "",
            learning_languages=profile.learning_languages or [],
            level=profile.level or "Beginner",
            created_at=user.created_at,
            total_words=self.repo.get_user_word_count(target_user_id),
            total_lists=self.repo.get_user_list_count(target_user_id),
            friend_count=self.repo.get_friend_count(target_user_id),
            is_friend=is_friend,
            request_status=request_status
        )

    def update_profile(self, user_id: str, data: ProfileUpdate) -> ProfilePublic:
        update_data = data.model_dump(exclude_none=True)
        self.repo.update_profile(user_id, update_data)
        return self.get_my_profile(user_id)

    # --- Friend Requests ---

    def send_friend_request(self, sender_id: str, receiver_id: str):
        if sender_id == receiver_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot send request to yourself")

        receiver = self.repo.get_user_by_id(receiver_id)
        if not receiver:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

        existing = self.repo.get_existing_request(sender_id, receiver_id)
        if existing:
            if existing.status == "accepted":
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Already friends")
            if existing.status == "pending":
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Request already pending")
            if existing.status == "rejected":
                existing.status = "pending"
                existing.sender_id = sender_id
                existing.receiver_id = receiver_id
                self.db.commit()
                return {"status": True, "detail": "Friend request sent"}

        self.repo.create_friend_request(sender_id, receiver_id)
        return {"status": True, "detail": "Friend request sent"}

    def respond_to_request(self, request_id: int, user_id: str, action: str):
        request = self.repo.get_friend_request_by_id(request_id)
        if not request:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found")

        if request.receiver_id != user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your request")

        if request.status != "pending":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Request already processed")

        if action not in ("accept", "reject"):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid action")

        new_status = "accepted" if action == "accept" else "rejected"
        self.repo.update_request_status(request_id, new_status)
        return {"status": True, "detail": f"Request {new_status}"}

    def get_pending_requests(self, user_id: str) -> list[FriendRequestOut]:
        requests = self.repo.get_pending_requests_for_user(user_id)
        result = []
        for req in requests:
            sender_profile = self.repo.get_or_create_profile(req.sender_id)
            result.append(FriendRequestOut(
                id=req.id,
                sender_id=req.sender_id,
                sender_name=req.sender.name,
                sender_avatar=sender_profile.avatar_url or "",
                receiver_id=req.receiver_id,
                receiver_name=req.receiver.name,
                receiver_avatar="",
                status=req.status,
                created_at=req.created_at
            ))
        return result

    def get_friends_list(self, user_id: str) -> list[FriendOut]:
        friend_ids = self.repo.get_friends(user_id)
        friends = []
        for fid in friend_ids:
            user = self.repo.get_user_by_id(fid)
            profile = self.repo.get_or_create_profile(fid)
            if user:
                friends.append(FriendOut(
                    user_id=user.id,
                    username=user.name,
                    avatar_url=profile.avatar_url or "",
                    level=profile.level or "Beginner",
                    learning_languages=profile.learning_languages or []
                ))
        return friends

    def remove_friend(self, user_id: str, friend_id: str):
        deleted = self.repo.delete_friend(user_id, friend_id)
        if not deleted:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Friendship not found")
        return {"status": True, "detail": "Friend removed"}

    # --- Search ---

    def search_users(self, query: str, current_user_id: str) -> list[UserSearchResult]:
        users = self.repo.search_users(query, current_user_id)
        results = []
        for u in users:
            profile = self.repo.get_or_create_profile(u.id)
            is_friend = self.repo.are_friends(current_user_id, u.id)
            request_status = self.repo.get_request_status(current_user_id, u.id)
            results.append(UserSearchResult(
                user_id=u.id,
                username=u.name,
                avatar_url=profile.avatar_url or "",
                level=profile.level or "Beginner",
                learning_languages=profile.learning_languages or [],
                is_friend=is_friend,
                request_status=request_status
            ))
        return results

    def update_user_streak(self, user_id: str):
        return self.repo.update_streak(user_id)