import redis.asyncio as redis
from app.core.config import settings

REDIS_URL = settings.REDIS_URL or "redis://localhost:6379/0"
redis_client = redis.from_url(REDIS_URL, decode_responses=True)