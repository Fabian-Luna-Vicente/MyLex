import pytest
from app.main import app
from app.core.dependencies import get_current_user
from app.models.user import User

mock_user = User(
    id="test_user_id",
    email="vocab@example.com",
    name="Vocab User",
    is_active=True,
    is_verified=True
)

def override_get_current_user():
    return mock_user

app.dependency_overrides[get_current_user] = override_get_current_user

def test_create_word(client):
    payload = {
        "name": "IntegrationWord",
        "meaning": "Meaning of word",
        "list_ids": []
    }
    response = client.post("/api/vocabulary/words", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "IntegrationWord"
    assert data["id"] is not None

def test_get_words(client):
    response = client.get("/api/vocabulary/words")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_get_word_not_found(client):
    response = client.get("/api/vocabulary/words/9999")
    assert response.status_code == 404
    assert "Word not found" in response.json()["detail"]
