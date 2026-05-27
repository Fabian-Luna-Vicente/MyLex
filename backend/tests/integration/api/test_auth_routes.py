import pytest
from app.models.user import User
from app.core.security import get_password_hash

def test_register_route(client):
    payload = {
        "email": "integration@test.com",
        "name": "Int Test",
        "password": "Password123!",
        "age": 25
    }
    response = client.post("/auth/register", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] is True
    assert "registered successfully" in data["detail"]

def test_register_route_duplicate(client):
    payload = {
        "email": "duplicate@test.com",
        "name": "Int Test",
        "password": "Password123!"
    }
    client.post("/auth/register", json=payload)
    
    # Second attempt
    response = client.post("/auth/register", json=payload)
    assert response.status_code == 400
    assert "Email already registered" in response.json()["detail"]

def test_login_route_success(client, db_session):
    # Setup test user directly in DB
    user = User(
        id="auth-test-id",
        email="login@test.com",
        name="Login Test",
        hashed_password=get_password_hash("SecurePass123!"),
        is_verified=True,
        is_active=True
    )
    db_session.add(user)
    db_session.commit()

    payload = {
        "email": "login@test.com",
        "password": "SecurePass123!"
    }
    response = client.post("/auth/login", json=payload)
    
    assert response.status_code == 200
    data = response.json()
    assert data["status"] is True
    assert "access_token" in data
    assert data["user"]["email"] == "login@test.com"
    
    # Check if cookies are set
    assert "access_token" in response.cookies
    assert "refresh_token" in response.cookies

def test_login_route_invalid_password(client, db_session):
    user = User(
        id="auth-test-id-2",
        email="wrongpass@test.com",
        name="Wrong Pass Test",
        hashed_password=get_password_hash("SecurePass123!"),
        is_verified=True,
        is_active=True
    )
    db_session.add(user)
    db_session.commit()

    payload = {
        "email": "wrongpass@test.com",
        "password": "WrongPassword!"
    }
    response = client.post("/auth/login", json=payload)
    
    assert response.status_code == 401
    assert "Invalid credentials" in response.json()["detail"]
