from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date

class ChatMessageBase(BaseModel):
    content: str
    message_type: str = "text"

class ChatMessageCreate(ChatMessageBase):
    room_id: int

class ChatMessageResponse(ChatMessageBase):
    id: int
    room_id: int
    sender_id: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class ChatRoomBase(BaseModel):
    is_ai_chat: bool

class ChatRoomCreate(ChatRoomBase):
    user2_id: Optional[str] = None # For human chat

class ChatRoomResponse(ChatRoomBase):
    id: int
    user1_id: Optional[str] = None
    user2_id: Optional[str] = None
    human_user_id: Optional[str] = None
    created_at: datetime
    
    # We can include the latest message or chat partner details
    partner_name: Optional[str] = None
    partner_avatar: Optional[str] = None

    class Config:
        from_attributes = True

class RoomVocabularyListCreate(BaseModel):
    list_id: int

class WordUsageUpdate(BaseModel):
    word_id: int
    usage_count: int = 1

class AIChatRequest(BaseModel):
    message: str
    room_id: int
    context_words: Optional[List[str]] = []
