from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

# --- Word Schemas ---

class WordBase(BaseModel):
    name: str = Field(..., max_length=100)
    past: Optional[str] = Field(None, max_length=100)
    gerund: Optional[str] = Field(None, max_length=100)
    participle: Optional[str] = Field(None, max_length=100)
    meaning: Optional[str] = None
    word_types: Optional[List[str]] = Field([], max_length=10)
    examples: Optional[List[str]] = Field([], max_length=15)
    image: Optional[str] = Field(None, max_length=1000)
    synonyms: Optional[str] = None
    antonyms: Optional[str] = None

class WordCreate(WordBase):
    list_ids: Optional[List[int]] = []

class WordUpdate(WordBase):
    name: Optional[str] = None
    list_ids: Optional[List[int]] = None

class WordInDBBase(WordBase):
    id: int
    user_id: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class WordResponse(WordInDBBase):
    lists: List["VocabularyListBasic"] = []


from typing import Optional, List, Literal
from pydantic import field_validator
from app.core.constants import VALID_LANGUAGES
from app.models.vocabulary import PrivacyLevel

# --- Vocabulary List Schemas ---

class VocabularyListBase(BaseModel):
    name: str = Field(..., max_length=100)
    privacy: Optional[PrivacyLevel] = PrivacyLevel.PUBLIC
    language: Optional[str] = 'English'

    @field_validator('language')
    @classmethod
    def validate_language(cls, v):
        if v is not None and v not in VALID_LANGUAGES:
            raise ValueError(f"Language must be one of the valid options.")
        return v

class VocabularyListCreate(VocabularyListBase):
    pass

class VocabularyListUpdate(VocabularyListBase):
    pass

class VocabularyListInDBBase(VocabularyListBase):
    id: int
    user_id: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class VocabularyListBasic(VocabularyListInDBBase):
    # Used to avoid circular references in responses
    pass

class VocabularyListResponse(VocabularyListInDBBase):
    words: List[WordInDBBase] = []

# Resolve circular references
WordResponse.model_rebuild()


# --- Game Progress Schemas ---

class ProgressUpsert(BaseModel):
    word_id: int
    game: str                        # 'random' | 'hangman' | ...
    difficulty: Optional[str] = None  # only for 'random'
    is_correct: Optional[bool] = None # only for non-random

class ProgressBulkUpsert(BaseModel):
    items: List[ProgressUpsert]

class ProgressResponse(BaseModel):
    id: int
    user_id: str
    word_id: int
    game: str
    difficulty: Optional[str] = None
    is_correct: Optional[bool] = None
    reviewed_at: datetime
    word: Optional[WordInDBBase] = None

    class Config:
        from_attributes = True
