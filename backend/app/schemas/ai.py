from pydantic import BaseModel, Field
from typing import List, Optional

# --- Dictionary Schemas ---

class DictionaryRequest(BaseModel):
    word: str = Field(..., min_length=1, max_length=60, description="Palabra o frase a definir")
    language: str = "en"
    t_lang: str = "en"
    use_ai: bool = False
    context: str = ""
    title: str = ""
    url: str = ""
    ai_language: str = "es"

# --- Grammar Schemas ---

class GrammarRequest(BaseModel):
    text: str = Field(..., min_length=2, max_length=500, description="Frase a analizar")
    language: str = "en"
    ai_language: str = "es"

# --- Corrector / Writing Schemas ---

class CorrectorRequest(BaseModel):
    userText: str = Field(..., max_length=2000)
    targetWords: List[str] = Field([], max_length=20)
    ai_language: str = Field("es", max_length=10)

# --- Translation Schemas ---

class TranslationRequest(BaseModel):
    text: str = Field(..., max_length=2000)
    source: str = Field("auto", max_length=10)
    target: str = Field("en", max_length=10)
    ai_language: str = Field("es", max_length=10)

