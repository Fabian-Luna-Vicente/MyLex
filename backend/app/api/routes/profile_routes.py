from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.services.profile_service import ProfileService
from app.schemas.profile import ProfileUpdate, FriendRequestCreate, FriendRequestAction

router = APIRouter()


def get_profile_service(db: Session = Depends(get_db)):
    return ProfileService(db)


# --- Profile ---

@router.get("/profile/me")
def get_my_profile(
    current_user: User = Depends(get_current_user),
    service: ProfileService = Depends(get_profile_service)
):
    return service.get_my_profile(current_user.id)


@router.put("/profile/me")
def update_my_profile(
    data: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    service: ProfileService = Depends(get_profile_service)
):
    return service.update_profile(current_user.id, data)


@router.get("/profile/{user_id}")
def get_user_profile(
    user_id: str,
    current_user: User = Depends(get_current_user),
    service: ProfileService = Depends(get_profile_service)
):
    return service.get_public_profile(user_id, current_user.id)


# --- Search ---

@router.get("/profile/search/users")
def search_users(
    q: str = Query(..., min_length=1),
    current_user: User = Depends(get_current_user),
    service: ProfileService = Depends(get_profile_service)
):
    return service.search_users(q, current_user.id)


# --- Friend Requests ---

@router.post("/friends/request")
def send_friend_request(
    data: FriendRequestCreate,
    current_user: User = Depends(get_current_user),
    service: ProfileService = Depends(get_profile_service)
):
    return service.send_friend_request(current_user.id, data.receiver_id)


@router.put("/friends/request/{request_id}")
def respond_to_request(
    request_id: int,
    data: FriendRequestAction,
    current_user: User = Depends(get_current_user),
    service: ProfileService = Depends(get_profile_service)
):
    return service.respond_to_request(request_id, current_user.id, data.action)


@router.get("/friends/requests")
def get_pending_requests(
    current_user: User = Depends(get_current_user),
    service: ProfileService = Depends(get_profile_service)
):
    return service.get_pending_requests(current_user.id)


# --- Friends List ---

@router.get("/friends")
def get_friends(
    current_user: User = Depends(get_current_user),
    service: ProfileService = Depends(get_profile_service)
):
    return service.get_friends_list(current_user.id)


@router.delete("/friends/{friend_id}")
def remove_friend(
    friend_id: str,
    current_user: User = Depends(get_current_user),
    service: ProfileService = Depends(get_profile_service)
):
    return service.remove_friend(current_user.id, friend_id)
