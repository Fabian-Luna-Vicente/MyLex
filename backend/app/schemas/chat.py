from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date

class ChatParticipantBase(BaseModel):
    role: Optional[str] = None
    is_ai: bool = False
    ai_name: Optional[str] = None
    ai_gender: Optional[str] = None
    ai_personality: Optional[str] = None
    ai_avatar_url: Optional[str] = None

class ChatParticipantCreate(ChatParticipantBase):
    user_id: Optional[str] = None

class AIPersonaBase(BaseModel):
    name: str
    gender: str = "female"
    personality: str
    avatar_url: Optional[str] = None

class AIPersonaCreate(AIPersonaBase):
    pass

class AIPersonaUpdate(BaseModel):
    name: Optional[str] = None
    gender: Optional[str] = None
    personality: Optional[str] = None
    avatar_url: Optional[str] = None

class AIPersonaResponse(AIPersonaBase):
    id: int
    user_id: str
    created_at: datetime

    class Config:
        from_attributes = True

class ChatParticipantResponse(ChatParticipantBase):
    id: int
    room_id: int
    user_id: Optional[str] = None
    name_display: str
    avatar_display: str

    class Config:
        from_attributes = True

class ChatRoomBase(BaseModel):
    name: str = "New Chat"
    description: Optional[str] = None
    context: Optional[str] = None
    language: str = "en"

class ChatRoomCreate(ChatRoomBase):
    initial_participants: List[ChatParticipantCreate] = []

class ChatRoomUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    context: Optional[str] = None

class ChatRoomResponse(ChatRoomBase):
    id: int
    created_by: str
    created_at: datetime
    participants: List[ChatParticipantResponse] = []

    class Config:
        from_attributes = True

class ChatMessageBase(BaseModel):
    content: str
    message_type: str = "text"

class ChatMessageCreate(ChatMessageBase):
    room_id: int

class ChatMessageResponse(ChatMessageBase):
    id: int
    room_id: int
    participant_id: int
    participant: Optional[ChatParticipantResponse] = None
    created_at: datetime

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
    mentioned_ai_participant_ids: Optional[List[int]] = []
    ai_language: str = "es"

class IcebreakerRequest(BaseModel):
    room_id: int
    language: str
    vocabulary_words: List[str]
    ai_language: str = "es"

class GrammarCheckRequest(BaseModel):
    message: str
    language: str = "es"
    ai_language: str = "es"