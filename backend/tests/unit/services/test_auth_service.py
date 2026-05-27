import pytest
from unittest.mock import Mock, patch
from app.services.auth_service import AuthService
from app.core.exceptions import ValidationError, AuthenticationError, ResourceNotFoundError
from app.models.user import User

@pytest.fixture
def auth_service():
    mock_db = Mock()
    service = AuthService(mock_db)
    service.user_repo = Mock()
    service.auth_repo = Mock()
    return service

def test_register_success(auth_service):
    auth_service.user_repo.get_user_by_email.return_value = None
    mock_user = User(id="123", email="test@test.com", name="Test", is_verified=False)
    auth_service.user_repo.create_user.return_value = mock_user

    with patch('app.services.auth_service.send_registration_verification_email') as mock_send_email:
        result = auth_service.register("test@test.com", "Test", "password123")
        
        assert result["status"] is True
        assert "registered successfully" in result["detail"]
        auth_service.user_repo.create_user.assert_called_once()
        mock_send_email.assert_called_once()

def test_register_duplicate_email(auth_service):
    auth_service.user_repo.get_user_by_email.return_value = Mock()
    
    with pytest.raises(ValidationError) as exc:
        auth_service.register("test@test.com", "Test", "password123")
    
    assert "Email already registered" in str(exc.value)

def test_traditional_login_success(auth_service):
    mock_user = Mock()
    mock_user.id = "123"
    mock_user.email = "test@test.com"
    mock_user.name = "Test"
    mock_user.is_active = True
    mock_user.is_verified = True
    
    from app.core.security import get_password_hash
    mock_user.hashed_password = get_password_hash("password123")
    
    auth_service.user_repo.get_user_by_email.return_value = mock_user
    
    result = auth_service.traditional_login("test@test.com", "password123")
    
    assert result["status"] is True
    assert "access_token" in result
    assert "refresh_token" in result

def test_traditional_login_unverified(auth_service):
    mock_user = Mock()
    mock_user.is_active = True
    mock_user.is_verified = False
    
    from app.core.security import get_password_hash
    mock_user.hashed_password = get_password_hash("password123")
    
    auth_service.user_repo.get_user_by_email.return_value = mock_user
    
    with pytest.raises(ValidationError) as exc:
        auth_service.traditional_login("test@test.com", "password123")
        
    assert "verify your email" in str(exc.value)

def test_traditional_login_wrong_password(auth_service):
    mock_user = Mock()
    from app.core.security import get_password_hash
    mock_user.hashed_password = get_password_hash("password123")
    auth_service.user_repo.get_user_by_email.return_value = mock_user
    
    with pytest.raises(AuthenticationError) as exc:
        auth_service.traditional_login("test@test.com", "wrongpassword")
        
    assert "Invalid credentials" in str(exc.value)
