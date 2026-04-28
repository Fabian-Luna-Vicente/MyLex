from sqlalchemy.orm import Session
from app.models.user import User, UserRefreshToken
from datetime import datetime

class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_user_by_id(self, user_id: str) -> User | None:
        return self.db.query(User).filter(User.id == user_id).first()

    def get_user_by_email(self, email: str) -> User | None:
        return self.db.query(User).filter(User.email == email).first()

    def create_user(self, id: str, email: str, name: str, age: int | None = None) -> User:
        db_user = User(id=id, email=email, name=name, age=age)
        self.db.add(db_user)
        self.db.commit()
        self.db.refresh(db_user)
        return db_user

    def save_refresh_token(self, user_id: str, jti: str, expires_at: datetime) -> UserRefreshToken:
        token_entry = UserRefreshToken(user_id=user_id, token_jti=jti, expires_at=expires_at)
        self.db.add(token_entry)
        self.db.commit()
        self.db.refresh(token_entry)
        return token_entry

    def get_refresh_token(self, jti: str, user_id: str) -> UserRefreshToken | None:
        return self.db.query(UserRefreshToken).filter(
            UserRefreshToken.token_jti == jti,
            UserRefreshToken.user_id == user_id
        ).first()

    def delete_refresh_token(self, jti: str, user_id: str) -> bool:
        token = self.get_refresh_token(jti, user_id)
        if token:
            self.db.delete(token)
            self.db.commit()
            return True
        return False

    def delete_expired_tokens(self) -> int:
        expired_tokens = self.db.query(UserRefreshToken).filter(UserRefreshToken.expires_at < datetime.utcnow())
        count = expired_tokens.count()
        expired_tokens.delete(synchronize_session=False)
        self.db.commit()
        return count
