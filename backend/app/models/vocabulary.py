from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import ARRAY
from app.core.database import Base

# Many-to-Many association table for Lists and Words
list_word_association = Table(
    "list_word_association",
    Base.metadata,
    Column("list_id", Integer, ForeignKey("vocabulary_lists.id", ondelete="CASCADE"), primary_key=True),
    Column("word_id", Integer, ForeignKey("words.id", ondelete="CASCADE"), primary_key=True)
)

class VocabularyList(Base):
    __tablename__ = "vocabulary_lists"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", backref="vocabulary_lists")
    words = relationship("Word", secondary=list_word_association, back_populates="lists")


class Word(Base):
    __tablename__ = "words"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    name = Column(String, nullable=False, index=True)
    past = Column(String, nullable=True)
    gerund = Column(String, nullable=True)
    participle = Column(String, nullable=True)
    meaning = Column(String, nullable=True)
    
    # Leveraging PostgreSQL ARRAY for types and examples
    word_types = Column(ARRAY(String), nullable=True, default=[])
    examples = Column(ARRAY(String), nullable=True, default=[])
    
    image = Column(String, nullable=True)
    synonyms = Column(String, nullable=True)
    antonyms = Column(String, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", backref="words")
    lists = relationship("VocabularyList", secondary=list_word_association, back_populates="words")
