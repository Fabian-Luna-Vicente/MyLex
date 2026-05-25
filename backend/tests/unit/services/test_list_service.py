import pytest
from unittest.mock import Mock
from app.services.list_service import ListService
from app.core.exceptions import ResourceNotFoundError, PermissionDeniedError
from app.schemas.vocabulary import ListCreate

def test_get_list_details_success(mocker):
    # Arrange
    mock_db = Mock()
    service = ListService(mock_db)
    
    # Mocking the repository methods
    mock_list = Mock()
    mock_list.id = 1
    mock_list.user_id = "user123"
    mock_list.privacy = "public"
    
    service.list_repo.get_list = Mock(return_value=mock_list)
    service.word_repo.get_words_by_list = Mock(return_value=[])
    service.list_repo.get_list_likes = Mock(return_value=0)
    service.list_repo.has_user_liked = Mock(return_value=False)
    
    # Act
    result = service.get_list_details(1, "user123")
    
    # Assert
    assert result.id == 1
    service.list_repo.get_list.assert_called_once_with(1)

def test_get_list_details_not_found(mocker):
    # Arrange
    mock_db = Mock()
    service = ListService(mock_db)
    service.list_repo.get_list = Mock(return_value=None)
    
    # Act & Assert
    with pytest.raises(ResourceNotFoundError) as exc:
        service.get_list_details(99, "user123")
    
    assert "List not found" in str(exc.value)

def test_get_list_details_permission_denied(mocker):
    # Arrange
    mock_db = Mock()
    service = ListService(mock_db)
    
    mock_list = Mock()
    mock_list.id = 1
    mock_list.user_id = "other_user"
    mock_list.privacy = "private"
    
    service.list_repo.get_list = Mock(return_value=mock_list)
    
    # Act & Assert
    with pytest.raises(PermissionDeniedError) as exc:
        service.get_list_details(1, "user123")
        
    assert "Not authorized" in str(exc.value)
