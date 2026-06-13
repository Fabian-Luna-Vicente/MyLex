from datetime import date, timedelta
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.usage import UserUsage
from app.models.user import User
from app.core.config_limits import get_user_limit

class UsageLimitException(HTTPException):
    def __init__(self, detail: str):
        super().__init__(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail=detail)

def get_start_of_week(dt: date) -> date:
    # Monday is 0, Sunday is 6
    return dt - timedelta(days=dt.weekday())

def get_or_create_usage(db: Session, user_id: str) -> UserUsage:
    today = date.today()
    week_start = get_start_of_week(today)
    
    usage = db.query(UserUsage).filter(UserUsage.user_id == user_id).first()
    
    if not usage:
        usage = UserUsage(
            user_id=user_id,
            daily_date=today,
            weekly_date=week_start
        )
        db.add(usage)
        db.commit()
        db.refresh(usage)
        return usage
        
    # Check if we need to reset daily counters
    if usage.daily_date != today:
        usage.daily_date = today
        usage.daily_dict_words = 0
        usage.daily_grammar_analysis = 0
        usage.daily_writing_corrections = 0
        usage.daily_chat_messages = 0
        usage.daily_chat_grammar_corrections = 0
        usage.daily_icebreakers = 0
        usage.daily_fluid_corrections = 0
        usage.daily_ai_pronunciation = 0
        usage.daily_direct_mode_messages = 0
        
    # Check if we need to reset weekly counters
    if usage.weekly_date != week_start:
        usage.weekly_date = week_start
        usage.weekly_dict_context_words = 0
        
    db.commit()
    db.refresh(usage)
    return usage

def check_limit_only(db: Session, user: User, limit_key: str, amount: int = 1):
    """
    Check if the user can perform an action without incrementing the counter.
    Raises UsageLimitException (HTTP 429) if the limit is exceeded.
    """
    usage = get_or_create_usage(db, user.id)
    limit = get_user_limit(user.subscription_tier, limit_key)
    
    if limit == -1:
        return True
        
    current_val = getattr(usage, limit_key, 0)
    
    if current_val + amount > limit:
        raise UsageLimitException(
            detail=f"Has alcanzado el límite para esta acción según tu plan {user.subscription_tier.capitalize()}."
        )
    return True

def increment_usage(db: Session, user: User, limit_key: str, amount: int = 1):
    """
    Increment the usage counter for a specific limit_key.
    """
    usage = get_or_create_usage(db, user.id)
    current_val = getattr(usage, limit_key, 0)
    setattr(usage, limit_key, current_val + amount)
    db.commit()
    return True

def check_and_increment_limit(db: Session, user: User, limit_key: str, amount: int = 1):
    """
    Check if the user can perform an action and increment the counter immediately.
    """
    check_limit_only(db, user, limit_key, amount)
    return increment_usage(db, user, limit_key, amount)
