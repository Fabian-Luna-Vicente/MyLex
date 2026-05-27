import pytest
from unittest.mock import Mock
from app.services.list_service import ListService
from app.core.exceptions import ResourceNotFoundError, PermissionDeniedError
from app.schemas.vocabulary import VocabularyListCreate

def test_get_list_success(mocker):
    # Arrange
    mock_db = Mock()
    service = ListService(mock_db, Mock())
    
    mock_list = Mock()
    mock_list.id = 1
    mock_list.user_id = "user123"
    mock_list.privacy = "public"
    
    service.repo.get_list_with_privacy_check = Mock(return_value=mock_list)
    
    # Act
    result = service.get_list(1, "user123")
    
    # Assert
    assert result.id == 1
    service.repo.get_list_with_privacy_check.assert_called_once_with(1, "user123")

def test_get_list_not_found(mocker):
    # Arrange
    mock_db = Mock()
    service = ListService(mock_db, Mock())
    
    service.repo.get_list_with_privacy_check = Mock(side_effect=ResourceNotFoundError("List not found"))
    
    # Act & Assert
    with pytest.raises(ResourceNotFoundError) as exc:
        service.get_list(99, "user123")
    
    assert "List not found" in str(exc.value)

def test_get_list_permission_denied(mocker):
    # Arrange
    mock_db = Mock()
    service = ListService(mock_db, Mock())
    
    service.repo.get_list_with_privacy_check = Mock(side_effect=PermissionDeniedError("Not authorized"))
    
    # Act & Assert
    with pytest.raises(PermissionDeniedError) as exc:
        service.get_list(1, "user123")
        
    assert "Not authorized" in str(exc.value)
