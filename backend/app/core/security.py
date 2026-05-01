import bcrypt
from datetime import datetime, timedelta
from typing import Any, Union, Tuple
from jose import jwt
from app.core.config import settings
import uuid
import bcrypt


ALGORITHM = "HS256"

# Time config
ACCESS_TOKEN_EXPIRE_MINUTES = 15  # Short duration
REFRESH_TOKEN_EXPIRE_DAYS = 30    # Long duration

def verify_password(plain_password: str, hashed_password: str) -> bool:
    password_byte_enc=plain_password.encode('utf-8')
    hashed_password_byte_enc=hashed_password.encode('utf-8')
    return bcrypt.checkpw(password_byte_enc,hashed_password_byte_enc) 

def get_password_hash(password: str) -> str:
    pwd_bytes=password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed_password=bcrypt.hashpw(pwd_bytes,salt)
    return hashed_password.decode('utf-8')

def create_access_token(subject: Union[str, Any], extra_data: dict = None) -> str:
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = {"exp": expire, "sub": str(subject), "type": "access"}
    if extra_data:
        to_encode.update(extra_data)
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def create_refresh_token(subject: Union[str, Any]) -> Tuple[str, str, datetime]:
    jti = str(uuid.uuid4())
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode = {
        "exp": expire,
        "sub": str(subject),
        "type": "refresh",
        "jti": jti
    }
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt, jti, expire
