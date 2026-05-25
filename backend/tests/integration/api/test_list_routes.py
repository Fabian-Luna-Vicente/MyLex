from app.main import app
from app.api.dependencies import get_current_active_user
from app.models.user import User

# Mock User for Authentication
mock_user = User(
    id="test_user_id",
    email="test@example.com",
    name="Test User",
    is_active=True,
    is_verified=True
)

def override_get_current_active_user():
    return mock_user

app.dependency_overrides[get_current_active_user] = override_get_current_active_user

def test_get_user_lists_empty(client):
    response = client.get("/api/vocabulary/lists")
    assert response.status_code == 200
    assert response.json() == []

def test_create_list(client):
    payload = {
        "name": "My Integration Test List",
        "description": "Integration Test",
        "language": "en",
        "privacy": "public"
    }
    
    response = client.post("/api/vocabulary/lists", json=payload)
    
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "My Integration Test List"
    assert data["user_id"] == "test_user_id"
    assert data["id"] is not None

def test_get_list_details_not_found(client):
    response = client.get("/api/vocabulary/lists/9999")
    # Will hit the exception handler mapping ResourceNotFoundError to 404
    assert response.status_code == 404
    assert "List not found" in response.json()["detail"]
