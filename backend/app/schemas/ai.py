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

# --- Grammar Schemas ---

class GrammarRequest(BaseModel):
    text: str = Field(..., min_length=2, max_length=500, description="Frase a analizar")
    language: str = "en"

# --- Corrector / Writing Schemas ---

class CorrectorRequest(BaseModel):
    context: str
    userText: str
    targetWords: List[str] = []
