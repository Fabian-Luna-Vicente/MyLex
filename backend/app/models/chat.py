from sqlalchemy import Column, String, Integer, DateTime, Boolean, ForeignKey, Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class ChatRoom(Base):
    __tablename__ = "chat_rooms"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String, nullable=False, default="New Chat")
    description = Column(String, nullable=True)
    context = Column(String, nullable=True) # e.g. "Ordering coffee in a cafe"
    language = Column(String, nullable=False, default="en") # Immutable ideally
    created_by = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Hybrid Memory
    summary = Column(String, nullable=True)
    last_summarized_message_id = Column(Integer, nullable=True)
    
    # Relationships
    participants = relationship("ChatParticipant", back_populates="room", cascade="all, delete-orphan")
    messages = relationship("ChatMessage", back_populates="room", cascade="all, delete-orphan")
    linked_lists = relationship("RoomVocabularyList", back_populates="room", cascade="all, delete-orphan")

class AIPersona(Base):
    __tablename__ = "ai_personas"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    gender = Column(String, default="female")
    personality = Column(String, nullable=False)
    avatar_url = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User")

class ChatParticipant(Base):
    __tablename__ = "chat_participants"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    room_id = Column(Integer, ForeignKey("chat_rooms.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=True) # Null if AI
    
    # Common
    role = Column(String, nullable=True) # The character/role they play in the context
    
    # AI specific
    is_ai = Column(Boolean, default=False)
    ai_name = Column(String, nullable=True)
    ai_gender = Column(String, nullable=True) # e.g. 'male', 'female'
    ai_personality = Column(String, nullable=True)
    ai_avatar_url = Column(String, nullable=True)

    room = relationship("ChatRoom", back_populates="participants")
    user = relationship("User")
    messages = relationship("ChatMessage", back_populates="participant", cascade="all, delete-orphan")

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    room_id = Column(Integer, ForeignKey("chat_rooms.id", ondelete="CASCADE"), nullable=False)
    participant_id = Column(Integer, ForeignKey("chat_participants.id", ondelete="CASCADE"), nullable=False)
    content = Column(String, nullable=False)
    message_type = Column(String, default="text") # 'text', 'audio'
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    room = relationship("ChatRoom", back_populates="messages")
    participant = relationship("ChatParticipant", back_populates="messages")

class RoomVocabularyList(Base):
    __tablename__ = "room_vocabulary_lists"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    room_id = Column(Integer, ForeignKey("chat_rooms.id", ondelete="CASCADE"), nullable=False)
    list_id = Column(Integer, ForeignKey("vocabulary_lists.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False) # Who linked it

    room = relationship("ChatRoom", back_populates="linked_lists")
    vocabulary_list = relationship("VocabularyList")

class WordUsageDaily(Base):
    __tablename__ = "word_usage_daily"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    word_id = Column(Integer, ForeignKey("words.id", ondelete="CASCADE"), nullable=False)
    date = Column(Date, server_default=func.current_date())
    usage_count = Column(Integer, default=1)
    
    word = relationship("Word")
