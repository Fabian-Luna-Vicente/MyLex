from fastapi import APIRouter, Depends, Body, Response, Cookie, HTTPException, BackgroundTasks, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.user import GoogleAuthRequest, UserRegister, UserLogin, EmailVerification, ForgotPasswordRequest, ResetPasswordRequest
from app.services.auth_service import AuthService
from app.core.config import settings
from app.core.limiter import limiter
from fastapi import Request

router = APIRouter()

def get_auth_service(db: Session = Depends(get_db)):
    return AuthService(db)

def cleanup_tokens_task(auth_service: AuthService):
    auth_service.user_repo.delete_expired_tokens()

@router.post("/register")
@limiter.limit("5/minute")
async def register_user(
    request: Request,
    data: UserRegister,
    background_tasks: BackgroundTasks,
    auth_service: AuthService = Depends(get_auth_service)
):
    return auth_service.register(
        email=data.email,
        name=data.name,
        password=data.password,
        age=data.age,
        background_tasks=background_tasks
    )

@router.post("/verify-email")
async def verify_email(
    data: EmailVerification,
    auth_service: AuthService = Depends(get_auth_service)
):
    return auth_service.verify_email(token=data.token)

@router.post("/forgot-password")
@limiter.limit("5/minute")
async def forgot_password(
    request: Request,
    data: ForgotPasswordRequest,
    background_tasks: BackgroundTasks,
    auth_service: AuthService = Depends(get_auth_service)
):
    return auth_service.request_password_reset(
        email=data.email, 
        background_tasks=background_tasks
    )

@router.post("/reset-password")
@limiter.limit("5/minute")
async def reset_password(
    request: Request,
    data: ResetPasswordRequest,
    auth_service: AuthService = Depends(get_auth_service)
):
    return auth_service.reset_password(
        token=data.token, 
        new_password=data.new_password
    )

@router.post("/login")
@limiter.limit("5/minute")
async def login(
    request: Request,
    response: Response,
    data: UserLogin,
    auth_service: AuthService = Depends(get_auth_service)
):
    result = auth_service.traditional_login(email=data.email, password=data.password)
    
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

    return {
        "status": True,
        "access_token": result["access_token"],
        "user": result["user"]
    }

@router.post("/google_signin")
@limiter.limit("5/minute")
async def google_signin(
    request: Request,
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
@limiter.limit("5/minute")
async def google_login(
    request: Request,
    response: Response,
    id_token: str = Body(embed=True),
    auth_service: AuthService = Depends(get_auth_service)
):
    result = await auth_service.login_with_google(id_token)
    
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
        path="/refresh" 
    )

    return {
        "status": True,
        "access_token": result["access_token"],
        "user": result["user"]
    }

@router.post("/refresh")
@limiter.limit("5/minute")
async def refresh_token(
    request: Request,
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
    return {
        "status": True,
        "access_token": result["access_token"]
    }

@router.post("/logout")
@limiter.limit("10/minute")
async def logout(
    request: Request,
    response: Response,
    background_tasks: BackgroundTasks,
    refresh_token: str = Cookie(None),
    access_token: str = Cookie(None),
    auth_service: AuthService = Depends(get_auth_service)
):
    background_tasks.add_task(cleanup_tokens_task, auth_service)

    await auth_service.logout(refresh_token=refresh_token, access_token=access_token)

    response.delete_cookie(key="access_token", httponly=True, secure=True, samesite="None", path="/")
    response.delete_cookie(key="refresh_token", httponly=True, secure=True, samesite="None", path="/refresh")

    return {"detail": "Logged out successfully"}
