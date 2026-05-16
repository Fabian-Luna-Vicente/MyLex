from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date


class ProfileUpdate(BaseModel):
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    country: Optional[str] = None
    native_language: Optional[str] = None
    learning_languages: Optional[List[str]] = None
    level: Optional[str] = None


class ProfilePublic(BaseModel):
    user_id: str
    username: str
    bio: str = ""
    avatar_url: str = ""
    country: str = ""
    native_language: str = ""
    learning_languages: List[str] = []
    level: str = "Beginner"
    created_at: Optional[datetime] = None
    current_streak: int = 0
    longest_streak: int = 0
    last_activity_date: Optional[date] = None
    total_words: int = 0
    total_lists: int = 0
    friend_count: int = 0
    is_friend: bool = False
    request_status: Optional[str] = None  # pending, accepted, rejected, none

    class Config:
        from_attributes = True


class FriendRequestCreate(BaseModel):
    receiver_id: str


class FriendRequestAction(BaseModel):
    action: str  # accept, reject


class FriendRequestOut(BaseModel):
    id: int
    sender_id: str
    sender_name: str
    sender_avatar: str = ""
    receiver_id: str
    receiver_name: str
    receiver_avatar: str = ""
    status: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class FriendOut(BaseModel):
    user_id: str
    username: str
    avatar_url: str = ""
    level: str = "Beginner"
    learning_languages: List[str] = []

    class Config:
        from_attributes = True


class UserSearchResult(BaseModel):
    user_id: str
    username: str
    avatar_url: str = ""
    level: str = "Beginner"
    learning_languages: List[str] = []
    is_friend: bool = False
    request_status: Optional[str] = None

    class Config:
        from_attributes = True
