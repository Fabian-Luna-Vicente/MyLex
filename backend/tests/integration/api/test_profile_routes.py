import pytest
from app.main import app
from app.core.dependencies import get_current_user
from app.models.user import User

mock_user = User(
    id="test_user_id",
    email="profile@example.com",
    name="Profile User",
    is_active=True,
    is_verified=True
)

def override_get_current_user():
    return mock_user

app.dependency_overrides[get_current_user] = override_get_current_user

def test_get_my_profile(client, db_session):
    user = User(
        id="test_user_id",
        email="profile@example.com",
        name="Profile User",
        hashed_password="pwd",
        is_verified=True,
        is_active=True
    )
    db_session.add(user)
    db_session.commit()

    response = client.get("/api/profile/me")
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "Profile User"
    assert "bio" in data
    assert "level" in data

def test_update_my_profile(client, db_session):
    user = User(
        id="test_user_id",
        email="profile@example.com",
        name="Profile User",
        hashed_password="pwd",
        is_verified=True,
        is_active=True
    )
    db_session.add(user)
    db_session.commit()

    payload = {
        "bio": "New Integration Bio",
        "level": "Intermediate",
        "native_language": "Spanish"
    }
    response = client.put("/api/profile/me", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["bio"] == "New Integration Bio"
    assert data["level"] == "Intermediate"
    assert data["native_language"] == "Spanish"
