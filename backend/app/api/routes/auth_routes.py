from fastapi import APIRouter, Depends, Body, Response, Cookie, HTTPException, BackgroundTasks, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.user import GoogleAuthRequest
from app.services.auth_service import AuthService
from app.core.config import settings

router = APIRouter()

def get_auth_service(db: Session = Depends(get_db)):
    return AuthService(db)

def cleanup_tokens_task(auth_service: AuthService):
    auth_service.user_repo.delete_expired_tokens()

@router.post("/google_signin")
async def google_signin(
    data: GoogleAuthRequest, 
    auth_service: AuthService = Depends(get_auth_service)
):
    result = await auth_service.signin(
        id_token=data.id_token, 
        username=data.username, 
        age=data.age
    )
    if not result.get("status"):
        return result 
    return result

@router.post("/google_login")
async def google_login(
    response: Response,
    id_token: str = Body(embed=True),
    auth_service: AuthService = Depends(get_auth_service)
):
    result = await auth_service.login(id_token)
    
    # We set cookies exactly as before, addressing the cookie vulnerability
    # using HttpOnly, Secure, SameSite=None
    
    response.set_cookie(
        key="access_token",
        value=result["access_token"],
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        httponly=True,
        secure=True,
        samesite="None",
        path="/"
    )

    response.set_cookie(
        key="refresh_token",
        value=result["refresh_token"],
        max_age=30 * 24 * 60 * 60, # 30 days
        httponly=True,
        secure=True,
        samesite="None",
        path="/refresh" # Scoped to refresh endpoint
    )

    return {
        "status": True,
        "access_token": result["access_token"],
        "user": result["user"]
    }

@router.post("/refresh")
async def refresh_token(
    response: Response,
    refresh_token: str = Cookie(None),
    auth_service: AuthService = Depends(get_auth_service)
):
    if not refresh_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token missing")

    result = auth_service.rotate_refresh_token(refresh_token)

    response.set_cookie(
        key="access_token",
        value=result["access_token"],
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        httponly=True, secure=True, samesite="None", path="/"
    )
    
    response.set_cookie(
        key="refresh_token",
        value=result["refresh_token"],
        max_age=30 * 24 * 60 * 60,
        httponly=True, secure=True, samesite="None", path="/refresh"
    )
    return {"message": "Tokens rotated successfully"}

@router.post("/logout")
async def logout(
    response: Response,
    background_tasks: BackgroundTasks,
    refresh_token: str = Cookie(None),
    access_token: str = Cookie(None),
    auth_service: AuthService = Depends(get_auth_service)
):
    # Run cleanup of expired tokens in background
    background_tasks.add_task(cleanup_tokens_task, auth_service)

    auth_service.logout(refresh_token=refresh_token, access_token=access_token)

    # Delete cookies
    response.delete_cookie(key="access_token", httponly=True, secure=True, samesite="None", path="/")
    response.delete_cookie(key="refresh_token", httponly=True, secure=True, samesite="None", path="/refresh")

    return {"detail": "Logged out successfully"}
