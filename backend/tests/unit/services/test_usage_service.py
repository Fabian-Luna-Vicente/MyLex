import pytest
from datetime import date, timedelta
from app.models.user import User
from app.models.usage import UserUsage
from app.services.usage_service import (
    get_or_create_usage,
    check_limit_only,
    increment_usage,
    check_and_increment_limit,
    UsageLimitException,
    get_start_of_week
)
from app.core.config_limits import SUBSCRIPTION_LIMITS, FAIR_USE_LIMITS

def create_mock_user(db_session, user_id="test_user", tier="free"):
    user = User(
        id=user_id,
        email=f"{user_id}@test.com",
        name="Test User",
        subscription_tier=tier
    )
    db_session.add(user)
    db_session.commit()
    return user

def test_get_or_create_usage_creates_new(db_session):
    user = create_mock_user(db_session)
    usage = get_or_create_usage(db_session, user.id)
    
    assert usage is not None
    assert usage.user_id == user.id
    assert usage.daily_date == date.today()
    assert usage.weekly_date == get_start_of_week(date.today())
    assert usage.daily_chat_messages == 0

def test_get_or_create_usage_resets_daily(db_session):
    user = create_mock_user(db_session)
    yesterday = date.today() - timedelta(days=1)
    
    # Create an old usage record manually
    old_usage = UserUsage(
        user_id=user.id,
        daily_date=yesterday,
        weekly_date=get_start_of_week(yesterday),
        daily_chat_messages=15
    )
    db_session.add(old_usage)
    db_session.commit()
    
    # Getting usage should reset daily_chat_messages to 0
    usage = get_or_create_usage(db_session, user.id)
    assert usage.daily_date == date.today()
    assert usage.daily_chat_messages == 0

def test_check_limit_free_user(db_session):
    user = create_mock_user(db_session, tier="free")
    
    # The limit for daily_chat_messages in free is 20
    assert SUBSCRIPTION_LIMITS["free"]["daily_chat_messages"] == 20
    
    # User has 0, should pass
    assert check_limit_only(db_session, user, "daily_chat_messages", 1) == True
    
    # Let's set the usage to 20
    usage = get_or_create_usage(db_session, user.id)
    usage.daily_chat_messages = 20
    db_session.commit()
    
    # Now it should raise UsageLimitException
    with pytest.raises(UsageLimitException) as excinfo:
        check_limit_only(db_session, user, "daily_chat_messages", 1)
    assert "Has alcanzado el límite" in str(excinfo.value.detail)

def test_check_limit_pro_user(db_session):
    user = create_mock_user(db_session, tier="pro")
    
    # The limit for daily_chat_messages in pro is 100
    assert SUBSCRIPTION_LIMITS["pro"]["daily_chat_messages"] == 100
    
    usage = get_or_create_usage(db_session, user.id)
    usage.daily_chat_messages = 99
    db_session.commit()
    
    # Should pass
    assert check_limit_only(db_session, user, "daily_chat_messages", 1) == True
    
    usage.daily_chat_messages = 100
    db_session.commit()
    
    # Should fail
    with pytest.raises(UsageLimitException):
        check_limit_only(db_session, user, "daily_chat_messages", 1)

def test_check_limit_premium_fair_use(db_session):
    user = create_mock_user(db_session, tier="premium")
    
    # The limit for daily_chat_messages in premium is -1, fair use is 500
    assert SUBSCRIPTION_LIMITS["premium"]["daily_chat_messages"] == -1
    assert FAIR_USE_LIMITS["daily_chat_messages"] == 500
    
    usage = get_or_create_usage(db_session, user.id)
    usage.daily_chat_messages = 499
    db_session.commit()
    
    # Should pass
    assert check_limit_only(db_session, user, "daily_chat_messages", 1) == True
    
    usage.daily_chat_messages = 500
    db_session.commit()
    
    # Should fail because it exceeds fair use soft limit
    with pytest.raises(UsageLimitException):
        check_limit_only(db_session, user, "daily_chat_messages", 1)

def test_increment_usage(db_session):
    user = create_mock_user(db_session, tier="free")
    
    increment_usage(db_session, user, "daily_dict_words", 5)
    usage = get_or_create_usage(db_session, user.id)
    assert usage.daily_dict_words == 5
    
    check_and_increment_limit(db_session, user, "daily_dict_words", 1)
    usage = get_or_create_usage(db_session, user.id)
    assert usage.daily_dict_words == 6
