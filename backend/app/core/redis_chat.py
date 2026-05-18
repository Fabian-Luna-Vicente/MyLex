import json
from app.core.redis import redis_client
from app.graph.state import ChatMessagePayload
from app.repositories.chat_repository import ChatRepository

MAX_MEMORY_MESSAGES = 10
CHAT_TTL = 3600 # 1 hora de inactividad

async def get_cached_history(room_id: int, repo: ChatRepository) -> list[ChatMessagePayload]:
    """Obtiene el historial de Redis. Si está vacío, hace fallback a PostgreSQL."""
    redis_key = f"chat:{room_id}:history"
    cached_messages = await redis_client.lrange(redis_key, 0, -1)
    
    if cached_messages:
        await redis_client.expire(redis_key, CHAT_TTL)
        return [ChatMessagePayload(**json.loads(msg)) for msg in cached_messages]
        
    recent_msgs = repo.get_messages(room_id, limit=MAX_MEMORY_MESSAGES)
    recent_msgs.reverse() 
    
    history = []
    if not recent_msgs:
        return history
        
    pipeline = redis_client.pipeline()
    for m in recent_msgs:
        payload = ChatMessagePayload(
            message_id=m.id,
            sender_participant_id=m.participant_id,
            sender_name=m.participant.ai_name if m.participant.is_ai else "User",
            is_ai=m.participant.is_ai,
            content=m.content,
            timestamp=m.created_at.isoformat()
        )
        history.append(payload)
        
        msg_dict = payload.model_dump() if hasattr(payload, 'model_dump') else (payload.dict() if hasattr(payload, 'dict') else payload)
        pipeline.rpush(redis_key, json.dumps(msg_dict, default=str))
        
    pipeline.expire(redis_key, CHAT_TTL)
    await pipeline.execute()
        
    return history

async def cache_new_message(room_id: int, payload: ChatMessagePayload):
    redis_key = f"chat:{room_id}:history"
    pipeline = redis_client.pipeline()
    
    msg_dict = payload.model_dump() if hasattr(payload, 'model_dump') else (payload.dict() if hasattr(payload, 'dict') else payload)
    
    pipeline.rpush(redis_key, json.dumps(msg_dict, default=str))
    pipeline.ltrim(redis_key, -MAX_MEMORY_MESSAGES, -1)
    pipeline.expire(redis_key, CHAT_TTL)
    
    await pipeline.execute()