def get_ai_prompt(context_type: str, language: str, target_lang: str, ai_language: str = "es") -> str:
    """
    Returns the appropriate prompt localized according to ai_language.
    ai_language should be 'en' or 'es'.
    """
    source_lang_instruction = f"del idioma '{language}'" if language and language != "auto" else "del idioma detectado de la palabra"
    if ai_language == "en":
        source_lang_instruction = f"from language '{language}'" if language and language != "auto" else "from the detected language of the word"
        
    if context_type == "dictionary":
        if ai_language == "en":
            return f"""
            Act as an INTELLIGENT BILINGUAL AND CONTEXTUAL DICTIONARY.
            
            INPUT: A word and a context.
            WORD LANGUAGE (SOURCE): {source_lang_instruction}.
            DEFINITION LANGUAGE (TARGET): {target_lang}.

            CRITICAL LANGUAGE SEPARATION INSTRUCTIONS:
            1. 'meaning' field: MUST be written EXCLUSIVELY in the TARGET language ({target_lang}).
            2. 'example', 'synonyms', 'antonyms' fields: MUST be kept STRICTLY in the SOURCE language ({source_lang_instruction}).
            3. 'type' field: Must be in the TARGET language ({target_lang}) (e.g., 'Noun', 'Verb').

            CONTEXT RULES:
            1. The first definition (1.) and the first example MUST match the usage of the word in the provided 'CONTEXT'.
            2. Generate 3 examples in total.

            OUTPUT FORMAT (JSON ARRAY with a single object):
            [
                {{
                    "name": "Word",
                    "language": "{language}",
                    "meaning": "Contextualized definition.\\nSecond definition.",
                    "type": ["Noun"],
                    "examples": ["Example 1", "Example 2", "Example 3"],
                    "synonyms": ["synonym1", "synonym2"],
                    "antonyms": [],
                    "image": ""
                }}
            ]
            
            NOTE: If the word doesn't exist, return "result": [].
            """
        else:
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
        if ai_language == "en":
            return f"""
            Act as a grammar teacher. Analyze the sentence and explain its structure.
            REQUIRED JSON FORMAT:
            IGNORE THE FACT THAT THESE INSTRUCTIONS MIGHT BE IN ENGLISH, THE EXPLANATION LANGUAGE MUST BE (TARGET): {target_lang}
            {{
                "original": "sentence",
                "general_explanation": "Detailed explanation in {target_lang}",
                "breakdown": [
                    {{ "segment": "part", "role": "grammatical role", "explanation": "explanation in {target_lang}" }}
                ]
            }}
            """
        else:
            return f"""
            Actúa como un profesor de gramática. Analiza la frase y explica su estructura.
            FORMATO JSON REQUERIDO:
            IGNORA EL HECHO DE LAS INSTRUCCIONES ESTÉN EN ESPAÑOL, EL IDIOMA DE LA EXPLICACIÓN DEBE SER (DESTINO): {target_lang}
            {{
                "original": "frase",
                "general_explanation": "Explicación detallada en {target_lang}",
                "breakdown": [
                    {{ "segment": "parte", "role": "rol gramatical", "explanation": "explicación en {target_lang}" }}
                ]
            }}
            """
            
    elif context_type == "corrector":
        if ai_language == "en":
            return """
            Act as a language teacher correcting a student in a friendly manner.
            ALWAYS return a JSON object with the following format, do not return loose Markdown.
            {
                "status": true,
                "corrected_text": "Natural corrected text",
                "explanation": "Brief explanation of errors",
                "words_used_correctly": true/false
            }
            """
        else:
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
        if ai_language == "en":
            return f"""
            Act as a PROFESSIONAL TRANSLATOR.
            SOURCE LANGUAGE: {language}
            TARGET LANGUAGE: {target_lang}
            
            ALWAYS return a JSON object with the following format:
            {{ "translation": "translated text" }}
            """
        else:
            return f"""
            Actúa como un TRADUCTOR PROFESIONAL.
            IDIOMA ORIGEN: {language}
            IDIOMA DESTINO: {target_lang}
            
            Devuelve SIEMPRE un objeto JSON con el siguiente formato:
            {{ "translation": "texto traducido" }}
            """
            
    return "Helpful assistant." if ai_language == "en" else "Asistente útil."

def get_corrector_user_prompt(user_text: str, target_words: list[str], ai_language: str = "es") -> str:
    words_str = ", ".join(target_words)
    if ai_language == "en":
        return f"""
        The user wrote: "{user_text}".
        They were required to use these words: {words_str}.
        Task context: "Address the user directly, do not talk about 'the student'. Act as an English teacher. Evaluate the text and strictly verify that all target words were included. Be flexible and approve the usage if valid grammatical forms of these words were used (e.g., past/gerund/participle conjugations if it's a verb, or plurals if it's a noun). If any is missing, tell them."
        
        1. Provide the corrected version of the text.
        2. Briefly explain the errors made in English.
        3. Confirm if the required words were used correctly.
        """
    else:
        return f"""
        El usuario escribió: "{user_text}".
        Debía usar obligatoriamente estas palabras: {words_str}.
        Contexto de la tarea: "Dirígete directamente a el usuario, no hables de 'el estudiante'. Actúa como un profesor de inglés. Evalúa mi texto y verifica estrictamente que haya incluido todas las palabras objetivo. Sé flexible y aprueba el uso si ha usado formas gramaticales válidas de estas palabras (por ejemplo, conjugaciones en pasado/gerundio/participio si es un verbo, o plurales si es un sustantivo). Si falta alguna, dile."
        
        1. Proporciona la versión corregida del texto.
        2. Explica brevemente los errores cometidos.
        3. Confirma si usó las palabras requeridas correctamente.
        """

def get_router_prompt(room_context: str, user_message: str, participants_info: str, ai_language: str = "es") -> str:
    if ai_language == "en":
        return f"""
        Room context: {room_context}
        Last message: "{user_message}"
        
        Available AI participants:
        {participants_info}
        
        Which of these AI participants should reply to this last message? It could be one or several depending on the situation.
        Take into account their role, their personality, and whether the message is implicitly directed at them or if they are the logical person to speak next in the scene.
        
        ALWAYS return a strict JSON object with a list of the IDs of the selected participants.
        Example: {{"selected_ids": [123, 456]}}
        """
    else:
        return f"""
        Contexto de la sala: {room_context}
        Último mensaje: "{user_message}"
        
        Participantes IA disponibles:
        {participants_info}
        
        ¿Cuál o cuáles de estos participantes IA deberían responder a este último mensaje? Puede ser uno o varios dependiendo de la situación.
        Ten en cuenta su rol, su personalidad, y si el mensaje está dirigido a ellos implícitamente o es quien lógicamente hablaría ahora en la escena.
        
        Devuelve SIEMPRE un objeto JSON estricto con una lista de los IDs de los participantes seleccionados.
        Ejemplo: {{"selected_ids": [123, 456]}}
        """

def get_router_system_prompt(ai_language: str = "es") -> str:
    return "You are an intelligent stage director. Return ONLY JSON." if ai_language == "en" else "Eres un director de escena inteligente. Devuelve SOLO JSON."

def get_icebreaker_prompt(chat_context: str, vocab_str: str, language: str, participants_info: str, ai_language: str = "es") -> str:
    if ai_language == "en":
        return f"""
        The context of our situation or conversation is: {chat_context}.
        The target language of the chat room is: {language}.
        The participants and their roles are: {participants_info}

        Your task is to generate a short, natural, and creative message to "break the ice" and start the conversation immersively.
        It can be from the perspective of any of the participants (or as a narrator if you prefer) setting the scene.
        
        STRICT RULES:
        1. The generated message MUST be EXCLUSIVELY in {language}. Do not use any other language.
        2. You must try to naturally include some of these words in your message: {vocab_str}.

        Only return the exact message you would send in the chat, without extra quotes, without generic AI greetings, and without explanatory text.
        """
    else:
        return f"""
        El contexto de nuestra situación o conversación es: {chat_context}.
        El idioma objetivo de la sala de chat es: {language}.
        Los participantes y sus roles son: {participants_info}

        Tu tarea es generar un mensaje corto, natural y creativo para "romper el hielo" y comenzar la conversación de forma inmersiva.
        Puede ser desde la perspectiva de cualquiera de los participantes (o como un narrador si prefieres) que establezca la escena.
        
        REGLAS ESTRICTAS:
        1. El mensaje generado DEBE estar EXCLUSIVAMENTE en el idioma {language}. No uses ningún otro idioma bajo ninguna circunstancia.
        2. Debes intentar incluir de forma natural algunas de estas palabras en tu mensaje: {vocab_str}.

        Solo devuelve el mensaje exacto que enviarías en el chat, sin comillas adicionales, sin saludos genéricos de IA y sin texto explicativo.
        """

def get_chat_prompt(user_message: str, ai_language: str = "es") -> str:
    if ai_language == "en":
        return f"""
        User says: "{user_message}"
        """
    else:
        return f"""
        El usuario dice: "{user_message}"
        """

def get_chat_system_context_default(ai_language: str = "es") -> str:
    if ai_language == "en":
        return "You are a friendly language exchange partner. Your goal is to help the user practice."
    return "Eres un amable compañero de intercambio de idiomas. Tu objetivo es ayudar al usuario a practicar."
