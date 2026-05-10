from sqlalchemy import Column, String, Integer, DateTime, Boolean, ForeignKey, Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class ChatRoom(Base):
    __tablename__ = "chat_rooms"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    is_ai_chat = Column(Boolean, default=False)
    
    # For human-to-human
    user1_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    user2_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    
    # For AI
    human_user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    messages = relationship("ChatMessage", back_populates="room", cascade="all, delete-orphan")
    linked_lists = relationship("RoomVocabularyList", back_populates="room", cascade="all, delete-orphan")

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    room_id = Column(Integer, ForeignKey("chat_rooms.id", ondelete="CASCADE"), nullable=False)
    sender_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=True) # Null if AI
    content = Column(String, nullable=False)
    message_type = Column(String, default="text") # 'text', 'audio'
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    room = relationship("ChatRoom", back_populates="messages")

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
