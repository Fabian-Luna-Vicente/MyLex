import pytest
from app.main import app
from app.core.dependencies import get_current_user
from app.models.user import User

mock_user = User(
    id="test_user_id",
    email="chat@example.com",
    name="Chat User",
    is_active=True,
    is_verified=True
)

def override_get_current_user():
    return mock_user

app.dependency_overrides[get_current_user] = override_get_current_user

def test_get_user_rooms_empty(client):
    response = client.get("/api/chat/rooms")
    assert response.status_code == 200
    assert response.json() == []

def test_create_room(client):
    payload = {
        "name": "Integration Chat",
        "description": "Integration test description",
        "context": "Casual",
        "language": "es"
    }
    response = client.post("/api/chat/rooms", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Integration Chat"
    assert data["language"] == "es"
    assert data["id"] is not None

def test_get_room_messages_not_found(client):
    response = client.get("/api/chat/rooms/9999/messages")
    assert response.status_code == 404
    assert "Room not found" in response.json()["detail"]
