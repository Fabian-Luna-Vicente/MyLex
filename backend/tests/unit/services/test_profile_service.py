import pytest
from unittest.mock import Mock
from app.services.profile_service import ProfileService
from app.core.exceptions import ResourceNotFoundError, ValidationError
from app.schemas.profile import ProfileUpdate
from datetime import datetime

@pytest.fixture
def profile_service():
    mock_db = Mock()
    service = ProfileService(mock_db)
    service.repo = Mock()
    return service

def test_get_my_profile_success(profile_service):
    mock_user = Mock()
    mock_user.id = "user-1"
    mock_user.name = "Test User"
    mock_user.created_at = datetime.now()
    
    mock_profile = Mock()
    mock_profile.bio = "Hello"
    mock_profile.avatar_url = "http://avatar"
    mock_profile.country = "United States"
    mock_profile.native_language = "en"
    mock_profile.ai_language = "es"
    mock_profile.learning_languages = ["es"]
    mock_profile.level = "Beginner"
    
    profile_service.repo.get_user_by_id.return_value = mock_user
    profile_service.repo.get_or_create_profile.return_value = mock_profile
    profile_service.repo.get_user_word_count.return_value = 10
    profile_service.repo.get_user_list_count.return_value = 2
    profile_service.repo.get_friend_count.return_value = 5
    
    result = profile_service.get_my_profile("user-1")
    assert result.username == "Test User"
    assert result.bio == "Hello"
    assert result.total_words == 10
    assert result.total_lists == 2
    assert result.friend_count == 5

def test_get_my_profile_not_found(profile_service):
    profile_service.repo.get_user_by_id.return_value = None
    with pytest.raises(ResourceNotFoundError):
        profile_service.get_my_profile("unknown")

def test_update_profile(profile_service):
    update_data = ProfileUpdate(bio="New Bio", country="United States")
    
    # Mock for get_my_profile called at the end
    mock_user = Mock()
    mock_user.id = "user-1"
    mock_user.name = "Test User"
    mock_user.created_at = datetime.now()
    mock_profile = Mock()
    mock_profile.bio = "New Bio"
    mock_profile.country = "US"
    mock_profile.avatar_url = ""
    mock_profile.native_language = "en"
    mock_profile.ai_language = "es"
    mock_profile.learning_languages = ["es"]
    mock_profile.level = "Beginner"
    
    profile_service.repo.get_user_by_id.return_value = mock_user
    profile_service.repo.get_or_create_profile.return_value = mock_profile
    profile_service.repo.get_user_word_count.return_value = 0
    profile_service.repo.get_user_list_count.return_value = 0
    profile_service.repo.get_friend_count.return_value = 0
    
    result = profile_service.update_profile("user-1", update_data)
    
    profile_service.repo.update_profile.assert_called_once_with("user-1", {"bio": "New Bio", "country": "United States"})
    assert result.bio == "New Bio"

def test_send_friend_request_to_self(profile_service):
    with pytest.raises(ValidationError):
        profile_service.send_friend_request("user-1", "user-1")

def test_send_friend_request_success(profile_service):
    profile_service.repo.get_user_by_id.return_value = Mock()
    profile_service.repo.get_existing_request.return_value = None
    
    result = profile_service.send_friend_request("user-1", "user-2")
    assert result["status"] is True
    profile_service.repo.create_friend_request.assert_called_with("user-1", "user-2")
