import pytest
from unittest.mock import Mock, patch
from app.services.chat_service import ChatService
from app.core.exceptions import ResourceNotFoundError, PermissionDeniedError
from app.schemas.chat import ChatRoomCreate
from datetime import datetime

@pytest.fixture
def chat_service():
    mock_db = Mock()
    service = ChatService(mock_db)
    service.repo = Mock()
    service.profile_repo = Mock()
    service.ai_service = Mock()
    return service

def test_create_room(chat_service):
    data = ChatRoomCreate(name="Test Room")
    mock_room = Mock()
    mock_room.id = 1
    mock_room.name = "Test Room"
    mock_room.description = None
    mock_room.context = None
    mock_room.language = "en"
    mock_room.created_by = "user-1"
    mock_room.created_at = datetime.now()
    mock_room.participants = []
    
    chat_service.repo.create_room.return_value = mock_room
    
    result = chat_service.create_room("user-1", data)
    assert result.name == "Test Room"
    assert result.id == 1

def test_update_room_success(chat_service):
    mock_room = Mock()
    mock_room.id = 1
    mock_room.name = "Old Name"
    mock_room.description = None
    mock_room.context = None
    mock_room.language = "en"
    mock_room.created_by = "user-1"
    mock_room.created_at = datetime.now()
    mock_participant = Mock()
    mock_participant.id = 1
    mock_participant.room_id = 1
    mock_participant.user_id = "user-1"
    mock_participant.role = "owner"
    mock_participant.is_ai = False
    mock_participant.ai_name = None
    mock_participant.ai_gender = None
    mock_participant.ai_personality = None
    mock_room.participants = [mock_participant]
    
    mock_user = Mock()
    mock_user.name = "Participant Name"
    chat_service.profile_repo.get_user_by_id.return_value = mock_user
    
    mock_profile = Mock()
    mock_profile.avatar_url = "http://avatar"
    chat_service.profile_repo.get_or_create_profile.return_value = mock_profile
    
    chat_service.repo.get_room_by_id.return_value = mock_room
    chat_service.repo.update_room.return_value = mock_room
    
    result = chat_service.update_room(1, "user-1", name="New Name")
    chat_service.repo.update_room.assert_called_with(1, "New Name", None, None)

def test_update_room_permission_denied(chat_service):
    mock_room = Mock()
    mock_room.id = 1
    mock_participant = Mock()
    mock_participant.user_id = "user-2"
    mock_room.participants = [mock_participant]
    
    chat_service.repo.get_room_by_id.return_value = mock_room
    
    with pytest.raises(PermissionDeniedError):
        chat_service.update_room(1, "user-1", name="New Name")

def test_leave_room_success(chat_service):
    mock_room = Mock()
    mock_room.id = 1
    
    mock_p1 = Mock()
    mock_p1.id = 10
    mock_p1.user_id = "user-1"
    mock_p1.is_ai = False
    
    mock_p2 = Mock()
    mock_p2.id = 11
    mock_p2.user_id = "user-2"
    mock_p2.is_ai = False
    
    mock_room.participants = [mock_p1, mock_p2]
    
    chat_service.repo.get_room_by_id.return_value = mock_room
    
    result = chat_service.leave_room(1, "user-1")
    assert result["status"] is True
    chat_service.repo.remove_participant.assert_called_with(10)
    chat_service.repo.delete_room.assert_not_called()

def test_leave_room_last_human(chat_service):
    mock_room = Mock()
    mock_room.id = 1
    
    mock_p1 = Mock()
    mock_p1.id = 10
    mock_p1.user_id = "user-1"
    mock_p1.is_ai = False
    
    mock_room.participants = [mock_p1]
    
    chat_service.repo.get_room_by_id.return_value = mock_room
    
    result = chat_service.leave_room(1, "user-1")
    assert "deleted" in result["detail"]
    chat_service.repo.delete_room.assert_called_with(1)
