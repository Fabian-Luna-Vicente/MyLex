from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JOSEError
from app.core.config import settings
from app.core.database import get_db
from app.repositories.user_repository import UserRepository
from sqlalchemy.orm import Session
from app.models.user import User
from app.repositories.auth_repository import AuthRepository
# We can use OAuth2PasswordBearer for Swagger UI, but since we use cookies mostly, we'll write a custom dependency.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/google_login")
auth_repo = AuthRepository()

async def get_current_user(request: Request, db: Session = Depends(get_db)) -> User:
    # First try from Authorization header
    token = request.headers.get("Authorization")
    if token and token.startswith("Bearer "):
        token = token.split(" ")[1]
    
    # If not in header, try cookie
    if not token:
        token = request.cookies.get("access_token")

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    is_blacklisted = await auth_repo.get_access_token(token)
    if is_blacklisted:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has been revoked"
        )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authentication credentials")
    except JOSEError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    user_repo = UserRepository(db)
    user = user_repo.get_user_by_id(user_id)
    
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user")

    return user

async def get_current_user_ws(token: str, db: Session) -> User | None:
    if not token:
        return None
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            return None
    except JOSEError:
        return None

    user_repo = UserRepository(db)
    user = user_repo.get_user_by_id(user_id)
    if user is None or not user.is_active:
        return None
    return user
