from sqlalchemy import Column, String, Integer, Date, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.core.database import Base

class UserUsage(Base):
    __tablename__ = "user_usages"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    # Reset dates
    daily_date = Column(Date, nullable=False)
    weekly_date = Column(Date, nullable=False)
    
    # Daily limits tracking
    daily_dict_words = Column(Integer, default=0)
    daily_grammar_analysis = Column(Integer, default=0)
    daily_writing_corrections = Column(Integer, default=0)
    daily_chat_messages = Column(Integer, default=0)
    daily_chat_grammar_corrections = Column(Integer, default=0)
    daily_icebreakers = Column(Integer, default=0)
    daily_fluid_corrections = Column(Integer, default=0)
    daily_ai_pronunciation = Column(Integer, default=0)
    daily_direct_mode_messages = Column(Integer, default=0)
    
    # Weekly limits tracking
    weekly_dict_context_words = Column(Integer, default=0)

    user = relationship("User", backref="usage")
