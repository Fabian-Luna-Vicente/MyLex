from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, date

class ChatParticipantBase(BaseModel):
    role: Optional[str] = Field(None, max_length=100)
    is_ai: bool = False
    ai_name: Optional[str] = Field(None, max_length=100)
    ai_gender: Optional[str] = Field(None, max_length=50)
    ai_personality: Optional[str] = Field(None, max_length=1000)
    ai_avatar_url: Optional[str] = Field(None, max_length=1000)

class ChatParticipantCreate(ChatParticipantBase):
    user_id: Optional[str] = None

class AIPersonaBase(BaseModel):
    name: str = Field(..., max_length=100)
    gender: str = Field("female", max_length=50)
    personality: str = Field(..., max_length=1000)
    avatar_url: Optional[str] = Field(None, max_length=1000)

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
    name: str = Field("New Chat", max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    context: Optional[str] = Field(None, max_length=1000)
    language: str = Field("en", max_length=10)

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
    content: str = Field(..., max_length=2000)
    message_type: str = Field("text", max_length=50)

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
    message: str = Field(..., max_length=2000)
    room_id: int
    context_words: Optional[List[str]] = Field([], max_length=50)
    mentioned_ai_participant_ids: Optional[List[int]] = Field([], max_length=10)
    ai_language: str = Field("es", max_length=10)

class IcebreakerRequest(BaseModel):
    room_id: int
    language: str = Field(..., max_length=10)
    vocabulary_words: List[str] = Field(..., max_length=50)
    ai_language: str = Field("es", max_length=10)

class GrammarCheckRequest(BaseModel):
    message: str = Field(..., max_length=2000)
    language: str = Field("es", max_length=10)
    ai_language: str = Field("es", max_length=10)

class PronunciationHelpRequest(BaseModel):
    text: str = Field(..., max_length=2000)
    language: str = Field(..., max_length=50)
    phonetics_style: str = Field(..., max_length=50)
    native_language: str = Field(..., max_length=50)

class GrammarSummaryRequest(BaseModel):
    corrections: List[dict]
    language: str = Field("es", max_length=50)
    ai_language: str = Field("es", max_length=50)