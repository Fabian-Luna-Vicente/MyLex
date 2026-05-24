import httpx
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from jose import jwt, JOSEError
from app.core.config import settings
from app.core.security import create_access_token, create_refresh_token
from app.repositories.user_repository import UserRepository
import os
import time
from datetime import datetime, timedelta
from jose import jwt, JOSEError
import uuid
from app.core.security import get_password_hash, verify_password
from app.repositories.auth_repository import AuthRepository
from app.services.email_service import send_registration_verification_email
from fastapi import BackgroundTasks

API_URL = "https://oauth2.googleapis.com/tokeninfo?id_token="

CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID") 

class AuthService:
    def __init__(self, db: Session):
        self.db = db
        self.user_repo = UserRepository(db)
        self.auth_repo = AuthRepository()

    def create_verification_token(self, email: str) -> str:
        expire = datetime.utcnow() + timedelta(hours=24)
        to_encode = {"exp": expire, "sub": email, "type": "verification"}
        return jwt.encode(to_encode, settings.SECRET_KEY, algorithm="HS256")

    async def revoke_token(self,token:str):
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            exp = payload.get("exp")
            now = int(time.time())
            ttl = exp - now
            if ttl > 0:
                await self.auth_repo.save_access_token(token, ttl)
        except:
            pass 

    def register(self, email: str, name: str, password: str, age: int | None = None, background_tasks: BackgroundTasks = None):
        existing_user = self.user_repo.get_user_by_email(email)
        if existing_user:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
        
        hashed_pw = get_password_hash(password)
        user_id = str(uuid.uuid4())
        
        user = self.user_repo.create_user(
            id=user_id, 
            email=email, 
            name=name, 
            age=age, 
            hashed_password=hashed_pw,
            is_verified=False
        )
        
        token = self.create_verification_token(email)
        
        if background_tasks:
            background_tasks.add_task(send_registration_verification_email, email, token)
        else:
            send_registration_verification_email(email, token)
        
        return {"status": True, "detail": "User registered successfully. Please verify your email."}

    def verify_email(self, token: str):
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
            if payload.get("type") != "verification":
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid token type")
            
            email = payload.get("sub")
            user = self.user_repo.get_user_by_email(email)
            if not user:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
            
            if user.is_verified:
                return {"status": True, "detail": "User already verified"}
                
            user.is_verified = True
            self.db.commit()
            return {"status": True, "detail": "Email verified successfully"}
            
        except JOSEError:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired verification token")

    def traditional_login(self, email: str, password: str):
        user = self.user_repo.get_user_by_email(email)
        if not user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
        
        if not user.hashed_password or not verify_password(password, user.hashed_password):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
            
        if not user.is_active:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user")
            
        if not user.is_verified:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Please verify your email first")

        access_token = create_access_token(
            subject=user.id, 
            extra_data={"email": user.email, "username": user.name}
        )
        refresh_token, jti, refresh_expire = create_refresh_token(subject=user.id)
        self.user_repo.save_refresh_token(user_id=user.id, jti=jti, expires_at=refresh_expire)

        return {
            "status": True,
            "access_token": access_token,
            "refresh_token": refresh_token,
            "user": {"id": user.id, "username": user.name, "email": user.email}
        }

    async def verify_google_token(self, id_token: str) -> dict:
        async with httpx.AsyncClient() as client:
            response = await client.get(API_URL + id_token)
            if response.status_code != 200:
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Google token")
            return response.json()

    async def login_with_google(self, id_token: str):
        user_info = await self.verify_google_token(id_token)
        email = user_info.get("email")
        sub = user_info.get("sub")

        if not email or not sub:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing email or sub in token")

        user = self.user_repo.get_user_by_id(sub)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User does not exist, please sign in")
        
        if not user.is_active:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user")

        # Create access token
        access_token = create_access_token(
            subject=user.id, 
            extra_data={"email": user.email, "username": user.name}
        )

        # Create refresh token
        refresh_token, jti, refresh_expire = create_refresh_token(subject=user.id)
        
        # Save refresh token
        self.user_repo.save_refresh_token(user_id=user.id, jti=jti, expires_at=refresh_expire)

        return {
            "status": True,
            "access_token": access_token,
            "refresh_token": refresh_token,
            "user": {
                "id": user.id,
                "username": user.name,
                "email": user.email
            }
        }

    def rotate_refresh_token(self, old_refresh_token: str):
        try:
            payload = jwt.decode(old_refresh_token, settings.SECRET_KEY, algorithms=["HS256"])
            user_id = payload.get("sub")
            old_jti = payload.get("jti")
            
            if not user_id or not old_jti:
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")

            # Verify and delete old token (Rotation)
            deleted = self.user_repo.delete_refresh_token(jti=old_jti, user_id=user_id)
            if not deleted:
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token already used or invalid")
            
            user = self.user_repo.get_user_by_id(user_id)
            if not user or not user.is_active:
                 raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found or inactive")

            # Generate new tokens
            new_access_token = create_access_token(
                subject=user.id, 
                extra_data={"email": user.email, "username": user.name}
            )
            new_refresh_token, new_jti, new_expire = create_refresh_token(subject=user.id)
            
            self.user_repo.save_refresh_token(user_id=user.id, jti=new_jti, expires_at=new_expire)

            return {
                "access_token": new_access_token,
                "refresh_token": new_refresh_token
            }
        except JOSEError:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    def logout(self, refresh_token: str | None, access_token: str | None):
        # We can implement a Redis blacklist here if needed for access_token,
        # but for now we just delete the refresh token from DB.
        if refresh_token:
            try:
                payload = jwt.decode(refresh_token, settings.SECRET_KEY, algorithms=["HS256"])
                user_id = payload.get("sub")
                jti = payload.get("jti")
                if user_id and jti:
                    self.user_repo.delete_refresh_token(jti=jti, user_id=user_id)
            except JOSEError:
                pass
