import pytest
from unittest.mock import Mock
from app.services.word_service import WordService
from app.schemas.vocabulary import WordCreate, WordUpdate

@pytest.fixture
def word_service():
    mock_word_repo = Mock()
    mock_list_repo = Mock()
    service = WordService(mock_word_repo, mock_list_repo)
    return service

def test_create_word(word_service):
    data = WordCreate(name="Hola", meaning="Hello", list_ids=[1])
    
    mock_list = Mock()
    word_service.list_repo.get_lists_by_ids.return_value = [mock_list]
    word_service.repo.create_word.return_value = Mock(name="Hola", id=1)
    
    result = word_service.create_word("user-1", data)
    
    word_service.list_repo.get_lists_by_ids.assert_called_once_with([1], "user-1")
    word_service.repo.create_word.assert_called_once_with("user-1", data, [mock_list])
    assert result.id == 1

def test_get_words(word_service):
    word_service.repo.get_words_by_user.return_value = []
    
    result = word_service.get_words("user-1", "Hola")
    
    word_service.repo.get_words_by_user.assert_called_once_with("user-1", "Hola")
    assert result == []

def test_update_word(word_service):
    data = WordUpdate(name="Hola Update", list_ids=[2])
    mock_list = Mock()
    word_service.list_repo.get_lists_by_ids.return_value = [mock_list]
    mock_res = Mock()
    mock_res.id = 1
    mock_res.name = "Hola Update"
    word_service.repo.update_word.return_value = mock_res
    
    result = word_service.update_word(1, "user-1", data)
    
    word_service.list_repo.get_lists_by_ids.assert_called_once_with([2], "user-1")
    word_service.repo.update_word.assert_called_once_with(1, "user-1", data, [mock_list])
    assert result.name == "Hola Update"

def test_delete_word(word_service):
    word_service.repo.delete_word.return_value = True
    result = word_service.delete_word(1, "user-1")
    word_service.repo.delete_word.assert_called_once_with(1, "user-1")
    assert result is True
