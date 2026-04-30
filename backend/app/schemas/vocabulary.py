from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

# --- Word Schemas ---

class WordBase(BaseModel):
    name: str
    past: Optional[str] = None
    gerund: Optional[str] = None
    participle: Optional[str] = None
    meaning: Optional[str] = None
    word_types: Optional[List[str]] = []
    examples: Optional[List[str]] = []
    image: Optional[str] = None
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


# --- Vocabulary List Schemas ---

class VocabularyListBase(BaseModel):
    name: str

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
