from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    name: str
    email: EmailStr
    age: Optional[int] = None

class UserCreate(UserBase):
    id_token: str # Google ID token

class UserInDB(UserBase):
    id: str
    is_active: bool
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
