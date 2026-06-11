import json
import logging
import asyncio
from app.core.exceptions import ExternalServiceError
from groq import AsyncGroq
import google.generativeai as genai
from app.schemas.ai import DictionaryRequest, GrammarRequest, CorrectorRequest, TranslationRequest
from app.core.config import settings
from app.repositories.dictionaryApi_repository import DictionaryApiRepository
from app.services.prompt_service import PromptService
from app.services.ai_prompts import (
    get_ai_prompt,
    get_corrector_user_prompt,
    get_router_prompt,
    get_router_system_prompt,
    get_icebreaker_prompt,
    get_chat_prompt,
    get_chat_system_context_default
)
from app.core.api_key_manager import api_key_manager

class AIService:
    def __init__(self):
        self.groq_model = "llama-3.3-70b-versatile"
        self.gemini_model = "gemini-1.5-flash"
        self.dict_repo = DictionaryApiRepository()

    def _get_prompt(self, context_type: str, language: str, target_lang: str, ai_language: str = "es") -> str:
        return get_ai_prompt(context_type, language, target_lang, ai_language)

    async def _call_llm(self, prompt: str, system_prompt: str, json_format: bool = True, temp: float = 0.1) -> str:
        max_retries = max(1, len(api_key_manager.get_all_keys()))
        last_error = None
        
        for attempt in range(max_retries):
            try:
                active_key = api_key_manager.get_active_key()
                provider = api_key_manager.provider
                
                if provider == "groq":
                    client = AsyncGroq(api_key=active_key)
                    chat_completion = await client.chat.completions.create(
                        messages=[
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": prompt}
                        ],
                        model=self.groq_model,
                        temperature=temp,
                        response_format={"type": "json_object"} if json_format else None,
                        max_completion_tokens=1024,
                    )
                    return chat_completion.choices[0].message.content
                else:
                    genai.configure(api_key=active_key)
                    model = genai.GenerativeModel(self.gemini_model, system_instruction=system_prompt)
                    generation_config = genai.types.GenerationConfig(
                        temperature=temp,
                        max_output_tokens=1024,
                        response_mime_type="application/json" if json_format else "text/plain"
                    )
                    response = await model.generate_content_async(
                        contents=prompt,
                        generation_config=generation_config
                    )
                    return response.text
            except Exception as e:
                error_msg = str(e).lower()
                print(f"[DEBUG AI Service] API Error ({provider}) on attempt {attempt}: {e}", flush=True)
                if "rate limit" in error_msg or "429" in error_msg or "api_key" in error_msg or "api key" in error_msg or "401" in error_msg or "403" in error_msg or "authentication" in error_msg:
                    api_key_manager.mark_key_failed(active_key)
                    last_error = e
                    continue
                else:
                    raise ExternalServiceError(f"Error AI ({provider}): {str(e)}")
                    
        raise ExternalServiceError(f"Error AI: All keys failed or rate limited. Last error: {str(last_error)}")

    # --- Dictionary Methods ---

    async def search_dictionary(self, request: DictionaryRequest, ai_language: str = "es"):
        clean_word = request.word.strip()
        
        if request.use_ai:
            prompt = f"""
            PALABRA A DEFINIR: "{clean_word}"
            INFORMACIÓN DE CONTEXTO:
            1. Párrafo original: "{request.context}"
            2. Título de la web: "{request.title}"
            """
            sys_prompt = self._get_prompt("dictionary", request.language, request.t_lang, ai_language)
            # LLM requires json output but prompt returns array inside a wrapper or directly an array.
            # Using JSON object response_format requires root to be an object. We'll wrap prompt instructions implicitly.
            # Groq JSON mode requires the output to be a JSON object, not an array.
            sys_prompt += "\nDEBES ENVOLVER LA RESPUESTA EN UN OBJETO CON LA CLAVE 'result'."
            
            resp_str = await self._call_llm(prompt, sys_prompt, json_format=True)
            try:
                parsed = json.loads(resp_str)
                if "result" in parsed:
                    return parsed["result"]
                return [parsed]
            except:
                return [{"name": clean_word, "meaning": "Error parsing AI", "examples": [], "error": True}]
        
        else:
            # Traditional Dictionary API
            if request.language == "en":
                return await self.dict_repo.getDefinition(clean_word)

            else:
                return [{
                    "name": clean_word, 
                    "meaning": "Traditional dictionary is only available for English. Please enable 'AI Mode'.",
                    "examples": [],
                    "error": True
                }]

    # --- Grammar Methods ---

    async def analyze_grammar(self, request: GrammarRequest, ai_language: str = "es"):
        clean_text = request.text.strip()
        if len(clean_text.split()) < 2:
            return {"error": True, "message": "Selecciona una frase completa, no solo una palabra."}

        sys_prompt = self._get_prompt("grammar", "auto", request.language, ai_language)
        sys_prompt += "\nENVUELVE LA RESPUESTA EN 'result'."
        
        resp_str = await self._call_llm(clean_text, sys_prompt, json_format=True)
        print("RESP_STR")
        print(resp_str)
        try:
            parsed = json.loads(resp_str)
            print("PARSED")
            print(parsed)
            if "result" in parsed:
                return {"status": True, "data": parsed["result"]}
            return {"status": True, "data": parsed}
        except:
            return {"status": False, "message": "Error procesando la respuesta de la IA."}

    # --- Corrector Methods ---

    async def correct_text(self, request: CorrectorRequest, ai_language: str = "es"):
        print(ai_language)
        prompt = get_corrector_user_prompt(request.userText, request.targetWords, ai_language)
        sys_prompt = self._get_prompt("corrector", "auto", "es", ai_language)
        resp_str = await self._call_llm(prompt, sys_prompt, json_format=True, temp=0.6)
        try:
            raw_response = resp_str.replace("```json", "").replace("```", "").strip()
            parsed = json.loads(raw_response)
            return {
                "status": True,
                "response": parsed
            }
        except Exception as e:
            return {
                "status": False,
                "message": "Error procesando la corrección."
            }

    # --- Translation Methods ---

    async def translate_text(self, request: TranslationRequest, ai_language: str = "es"):
        clean_text = request.text.strip()
        sys_prompt = self._get_prompt("translation", request.source, request.target, ai_language)
        resp_str = await self._call_llm(clean_text, sys_prompt, json_format=True)
        try:
            parsed = json.loads(resp_str)
            return {"status": True, "translation": parsed.get("translation", "")}
        except:
            return {"status": False, "message": "Error translating text."}

    async def generate_chat_response(self, user_message: str, context_words: list[str], system_context: str = None, language: str = "english", ai_language: str = "es") -> str:
        prompt = get_chat_prompt(user_message, ai_language)
        
        default_sys = get_chat_system_context_default(ai_language)
        sys_prompt = f"""
        {system_context or default_sys}
        
        {PromptService.get_chat_response_rules(language, context_words)}
        """
        
        resp_str = await self._call_llm(prompt, sys_prompt, json_format=True, temp=0.7)
        try:
            parsed = json.loads(resp_str)
            return parsed.get("response", "I'm sorry, I couldn't understand that. Could you rephrase?")
        except Exception as e:
            print(f"Chat AI Error: {e}")
            return "Sorry, I'm having trouble thinking right now."

    async def select_ai_to_reply(self, room_context: str, user_message: str, ai_participants: list, ai_language: str = "es") -> list[int]:
        if len(ai_participants) == 1:
            return [ai_participants[0].id]
            
        participants_info = [{"id": p.id, "name": p.ai_name, "role": p.role, "personality": p.ai_personality} for p in ai_participants]
        prompt = get_router_prompt(room_context, user_message, json.dumps(participants_info), ai_language)
        sys_prompt = get_router_system_prompt(ai_language)
        
        resp_str = await self._call_llm(prompt, sys_prompt, json_format=True, temp=0.2)
        try:
            parsed = json.loads(resp_str)
            if "selected_ids" in parsed and isinstance(parsed["selected_ids"], list):
                return parsed["selected_ids"]
            if "selected_id" in parsed:
                return [parsed["selected_id"]]
            return [ai_participants[0].id]
        except Exception as e:
            print(f"Router AI Error: {e}")
            return [ai_participants[0].id]

    async def generate_icebreaker_message(self, chat_context: str, vocabulary: list[str], language: str, participants_info: str, ai_language: str = "es") -> str:
        vocab_str = ", ".join(vocabulary) if vocabulary else "vocabulario básico"
        prompt = get_icebreaker_prompt(chat_context, vocab_str, language, participants_info, ai_language)
        sys_prompt = f"You are a creative writer. You must generate the text ONLY in {language}." if ai_language == "en" else f"Eres un escritor creativo. Debes generar el texto ÚNICAMENTE en {language}."
        
        try:
            return await self._call_llm(prompt, sys_prompt, json_format=False, temp=0.7)
        except Exception as e:
            print(f"Error en generate_icebreaker_message: {e}")
            return "¡Hola! Estoy listo para empezar a hablar."