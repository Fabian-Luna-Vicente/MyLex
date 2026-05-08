import os
import json
import httpx
from fastapi import HTTPException
from groq import AsyncGroq
from app.schemas.ai import DictionaryRequest, GrammarRequest, CorrectorRequest, TranslationRequest
from app.core.config import settings
from app.repositories.dictionaryApi_repository import DictionaryApiRepository

class AIService:
    def __init__(self):
        self.client = AsyncGroq(api_key=settings.GROQ_API_KEY)
        self.model = "llama-3.3-70b-versatile"
        self.dict_repo = DictionaryApiRepository()

    def _get_prompt(self, context_type: str, language: str, target_lang: str) -> str:
        source_lang_instruction = f"del idioma '{language}'" if language and language != "auto" else "del idioma detectado de la palabra"
        
        if context_type == "dictionary":
            return f"""
            Actúa como un DICCIONARIO BILINGÜE Y CONTEXTUAL INTELIGENTE.
            
            INPUT: Una palabra y un contexto.
            IDIOMA DE LA PALABRA (ORIGEN): {source_lang_instruction}.
            IDIOMA DE LA DEFINICIÓN  (DESTINO): {target_lang}.

            INSTRUCCIONES CRÍTICAS DE SEPARACIÓN DE IDIOMAS:
            1. Campo 'meaning': DEBE estar escrito EXCLUSIVAMENTE en el idioma DESTINO ({target_lang}).
            2. Campos 'example', 'synonyms', 'antonyms': DEBEN mantenerse OBLIGATORIAMENTE en el idioma ORIGEN ({source_lang_instruction}).
            3. Campo 'type': Debe estar en el idioma DESTINO ({target_lang}) (ej: 'Noun', 'Verb').

            REGLAS DE CONTEXTO:
            1. La primera definición (1.) y el primer ejemplo DEBEN coincidir con el uso de la palabra en el 'CONTEXTO' provisto.
            2. Genera 3 ejemplos en total.

            FORMATO DE SALIDA (JSON ARRAY con un solo objeto):
            [
                {{
                    "name": "Palabra",
                    "language": "{language}",
                    "meaning": "Definición contextualizada.\\nSegunda definición.",
                    "type": ["Noun"],
                    "examples": ["Ejemplo 1", "Ejemplo 2", "Ejemplo 3"],
                    "synonyms": ["sinónimo1", "sinónimo2"],
                    "antonyms": [],
                    "image": ""
                }}
            ]
            
            NOTA: Si la palabra no existe, devuelve "result": [].
            """
        
        elif context_type == "grammar":
            return f"""
            Actúa como un profesor de gramática. Analiza la frase y explica su estructura.
            FORMATO JSON REQUERIDO:
            IGNORA EL HECHO DE LAS INSTRUCCIONES ESTEN EN ESPAÑOL, EL IDIOMA DE LA EXPLICACIÓN DEBE SER (DESTINO): {target_lang}
            {{
                "original": "frase",
                "general_explanation": "Explicación detallada en {target_lang}",
                "breakdown": [
                    {{ "segment": "parte", "role": "rol gramatical", "explanation": "explicación en {target_lang}" }}
                ]
            }}
            """
        
        elif context_type == "corrector":
            return """
            Actúa como un profesor de idiomas corrigiendo a un estudiante de forma amigable.
            Devuelve SIEMPRE un objeto JSON con el siguiente formato, no devuelvas Markdown suelto.
            {
                "status": true,
                "corrected_text": "Texto corregido natural",
                "explanation": "Explicación breve de los errores",
                "words_used_correctly": true/false
            }
            """
        
        elif context_type == "translation":
            return f"""
            Actúa como un TRADUCTOR PROFESIONAL.
            IDIOMA ORIGEN: {language}
            IDIOMA DESTINO: {target_lang}
            
            Devuelve SIEMPRE un objeto JSON con el siguiente formato:
            {{ "translation": "texto traducido" }}
            """
        return "Asistente útil."

    async def _call_llm(self, prompt: str, system_prompt: str, json_format: bool = True, temp: float = 0.1) -> str:
        try:
            chat_completion = await self.client.chat.completions.create(
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt}
                ],
                model=self.model,
                temperature=temp,
                response_format={"type": "json_object"} if json_format else None,
                max_completion_tokens=1024,
            )
            return chat_completion.choices[0].message.content
        except Exception as e:
            raise HTTPException(status_code=503, detail=f"Error AI: {str(e)}")

    # --- Dictionary Methods ---

    async def search_dictionary(self, request: DictionaryRequest):
        clean_word = request.word.strip()
        
        if request.use_ai:
            prompt = f"""
            PALABRA A DEFINIR: "{clean_word}"
            INFORMACIÓN DE CONTEXTO:
            1. Párrafo original: "{request.context}"
            2. Título de la web: "{request.title}"
            """
            sys_prompt = self._get_prompt("dictionary", request.language, request.t_lang)
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

    async def analyze_grammar(self, request: GrammarRequest):
        clean_text = request.text.strip()
        if len(clean_text.split()) < 2:
            return {"error": True, "message": "Selecciona una frase completa, no solo una palabra."}

        sys_prompt = self._get_prompt("grammar", "auto", request.language)
        sys_prompt += "\nENVUELVE LA RESPUESTA EN 'result'."
        
        resp_str = await self._call_llm(clean_text, sys_prompt, json_format=True)
        try:
            parsed = json.loads(resp_str)
            if "result" in parsed:
                return {"status": True, "data": parsed["result"]}
            return {"status": True, "data": parsed}
        except:
            return {"status": False, "message": "Error procesando la respuesta de la IA."}

    # --- Corrector Methods ---

    async def correct_text(self, request: CorrectorRequest):
        prompt = f""" 
        El usuario escribió: "{request.userText}".
        Debía usar obligatoriamente estas palabras: {", ".join(request.targetWords)}.
        Contexto de la tarea: "Dirígete directamente a el usuario, no hables de 'el estudiante'. Actúa como un profesor de inglés. Evalúa mi texto y verifica estrictamente que haya incluido todas las palabras objetivo. Sé flexible y aprueba el uso si ha usado formas gramaticales válidas de estas palabras (por ejemplo, conjugaciones en pasado/gerundio/participio si es un verbo, o plurales si es un sustantivo). Si falta alguna, dile."
        
        1. Proporciona la versión corregida del texto.
        2. Explica brevemente los errores cometidos.
        3. Confirma si usó las palabras requeridas correctamente.
        """
        sys_prompt = self._get_prompt("corrector", "auto", "es")
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

    async def translate_text(self, request: TranslationRequest):
        clean_text = request.text.strip()
        sys_prompt = self._get_prompt("translation", request.source, request.target)
        resp_str = await self._call_llm(clean_text, sys_prompt, json_format=True)
        try:
            parsed = json.loads(resp_str)
            return {"status": True, "translation": parsed.get("translation", "")}
        except:
            return {"status": False, "message": "Error translating text."}
