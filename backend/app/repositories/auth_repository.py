from app.core.redis import redis_client

class AuthRepository:
    def __init__(self):
        pass

    async def save_access_token(self, token: str, ttl: int):
        await redis_client.setex(f"bl_{token}", ttl, "revoked")

    async def get_access_token(self, token: str) -> bool:
        return await redis_client.get(f"bl_{token}")