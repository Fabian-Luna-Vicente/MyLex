from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    name: str
    email: EmailStr
    age: Optional[int] = None

class UserCreate(UserBase):
    id_token: str # Google ID token

class UserRegister(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class EmailVerification(BaseModel):
    token: str

class UserInDB(UserBase):
    id: str
    is_active: bool
    is_verified: bool
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    sub: Optional[str] = None

class GoogleAuthRequest(BaseModel):
    id_token: str
    username: Optional[str] = None
    age: Optional[int] = None
