import json
from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user, get_current_user_ws
from app.models.user import User
from app.services.chat_service import ChatService
from app.schemas.chat import ChatRoomCreate, ChatRoomUpdate, RoomVocabularyListCreate, AIChatRequest, IcebreakerRequest, GrammarCheckRequest, ChatParticipantCreate, AIPersonaCreate, AIPersonaUpdate, PronunciationHelpRequest, GrammarSummaryRequest
from app.services.ai_service import AIService
from app.services.ai_prompts import get_grammar_check_prompt, get_grammar_check_system_prompt, get_pronunciation_prompt, get_pronunciation_system_prompt
from app.repositories.profile_repository import ProfileRepository
from app.core.limiter import limiter
from fastapi import Request
from app.core.ws_connection import ConnectionManager

router = APIRouter()
manager = ConnectionManager()

def get_chat_service(db: Session = Depends(get_db)):
    return ChatService(db)

@router.get("/rooms")
def get_rooms(
    request: Request,
    current_user: User = Depends(get_current_user),
    service: ChatService = Depends(get_chat_service)
):
    return service.get_user_rooms(current_user.id)

@router.post("/rooms")
@limiter.limit("5/minute")
def create_room(
    request: Request,
    data: ChatRoomCreate,
    current_user: User = Depends(get_current_user),
    service: ChatService = Depends(get_chat_service)
):
    from app.core.config_limits import get_user_limit
    limit = get_user_limit(current_user.subscription_tier, "max_chat_rooms")
    if limit != -1:
        current_rooms = service.get_user_rooms(current_user.id)
        if len(current_rooms) >= limit:
            from fastapi import HTTPException, status
            raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail=f"Has alcanzado el límite de {limit} chat rooms de tu plan.")
            
    return service.create_room(current_user.id, data)

@router.put("/rooms/{room_id}")
@limiter.limit("10/minute")
def update_room(
    request: Request,
    room_id: int,
    data: ChatRoomUpdate,
    current_user: User = Depends(get_current_user),
    service: ChatService = Depends(get_chat_service)
):
    return service.update_room(room_id, current_user.id, data.name, data.description, data.context)

@router.delete("/rooms/{room_id}/leave")
@limiter.limit("5/minute")
def leave_room(
    request: Request,
    room_id: int,
    current_user: User = Depends(get_current_user),
    service: ChatService = Depends(get_chat_service)
):
    return service.leave_room(room_id, current_user.id)

@router.post("/rooms/{room_id}/participants")
def add_participant(
    request: Request,
    room_id: int,
    data: ChatParticipantCreate,
    current_user: User = Depends(get_current_user),
    service: ChatService = Depends(get_chat_service)
):
    from app.core.config_limits import get_user_limit
    limit = get_user_limit(current_user.subscription_tier, "max_companions_per_room")
    if limit != -1 and data.is_ai:
        room = service.repo.get_room_by_id(room_id)
        if room:
            ai_count = sum(1 for p in room.participants if p.is_ai)
            if ai_count >= limit:
                from fastapi import HTTPException, status
                raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail=f"Límite de {limit} compañeros AI por sala alcanzado.")
                
    return service.add_participant(room_id, current_user.id, data)

@router.get("/rooms/{room_id}/messages")
def get_messages(
    request: Request,
    room_id: int,
    current_user: User = Depends(get_current_user),
    service: ChatService = Depends(get_chat_service)
):
    return service.get_room_messages(room_id, current_user.id)

@router.get("/rooms/{room_id}/vocabulary")
def get_room_vocabulary(
    request: Request,
    room_id: int,
    current_user: User = Depends(get_current_user),
    service: ChatService = Depends(get_chat_service)
):
    return service.get_room_vocabulary(room_id, current_user.id)

@router.post("/rooms/{room_id}/vocabulary")
def link_list_to_room(
    request: Request,
    room_id: int,
    data: RoomVocabularyListCreate,
    current_user: User = Depends(get_current_user),
    service: ChatService = Depends(get_chat_service)
):
    from app.core.config_limits import get_user_limit
    limit = get_user_limit(current_user.subscription_tier, "max_linked_lists_per_room")
    if limit != -1:
        vocab = service.get_room_vocabulary(room_id, current_user.id)
        if len(vocab) >= limit:
            from fastapi import HTTPException, status
            raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail=f"Límite de {limit} listas vinculadas por sala alcanzado.")
            
    return service.link_list_to_room(room_id, data.list_id, current_user.id)

@router.post("/ai/message")
@limiter.limit("10/minute")
async def send_ai_message(
    request: Request,
    data: AIChatRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    service: ChatService = Depends(get_chat_service),
    db: Session = Depends(get_db)
):
    from app.services.usage_service import check_and_increment_limit
    check_and_increment_limit(db, current_user, "daily_chat_messages")
    
    return await service.send_ai_message(
        room_id=data.room_id, 
        user_id=current_user.id, 
        content=data.message, 
        context_words=data.context_words,
        mentioned_ai_participant_ids=data.mentioned_ai_participant_ids,
        ai_language=data.ai_language,
        background_tasks=background_tasks
    )

# --- WebSocket Endpoint ---

@router.websocket("/ws/{room_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    room_id: int,
    db: Session = Depends(get_db)
):
    token = websocket.cookies.get("access_token")
    user = await get_current_user_ws(token, db)
    if not user:
        await websocket.close(code=1008)
        return
        
    service = ChatService(db)
    try:
        room = service.repo.get_room_by_id(room_id)
        if not room or not any(p.user_id == user.id for p in room.participants):
            await websocket.close(code=1008)
            return
    except:
        await websocket.close(code=1008)
        return

    await manager.connect(websocket, room_id, str(user.id))
    try:
        while True:
            data_str = await websocket.receive_text()
            data = json.loads(data_str)

            # Fluid Mode signaling — broadcast as-is, do NOT save to DB
            if data.get("_fluid_signal"):
                await manager.broadcast(data_str, room_id)
                continue

            # Fluid Mode Audio Request
            if data.get("_fluid_audio_request"):
                import base64
                audio_b64 = data.get("audio_b64")
                mime_type = data.get("mime_type", "audio/webm")
                ai_id = data.get("ai_id")
                
                try:
                    audio_bytes = base64.b64decode(audio_b64)
                    ai_svc = AIService()
                    # Just use basic context or fetch from DB if needed
                    # We'll fetch room language context
                    room_lang = room.language if room else "english"
                    ai_lang = user.native_language if user else "es"
                    
                    response_data = await ai_svc.generate_audio_response(
                        audio_bytes, 
                        mime_type, 
                        system_context=f"You are participating in a voice chat in {room_lang}.", 
                        language=room_lang,
                        ai_language=ai_lang
                    )
                    
                    # Broadcast the audio response
                    resp_payload = {
                        "_fluid_signal": True,
                        "type": "fluid_audio_response",
                        "text": response_data["text"],
                        "audio_b64": response_data["audio_b64"],
                        "ai_id": ai_id,
                        "participant": {"is_ai": True, "user_id": ai_id}
                    }
                    await manager.broadcast(json.dumps(resp_payload), room_id)
                except Exception as e:
                    print(f"WS Audio Error: {e}")
                continue

            content = data.get("content")
            msg_type = data.get("message_type", "text")
            
            msg = service.send_human_message(room_id, user.id, content, msg_type)
            
            await manager.broadcast(json.dumps(msg.model_dump(mode='json')), room_id)
            
    except WebSocketDisconnect:
        manager.disconnect(websocket, room_id, str(user.id))

@router.post("/icebreaker")
@limiter.limit("5/minute")
async def get_icebreaker(
    request: Request,
    payload: IcebreakerRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    from app.services.usage_service import check_and_increment_limit
    check_and_increment_limit(db, current_user, "daily_icebreakers")
    
    service = ChatService(db)
    room = service.repo.get_room_by_id(payload.room_id)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
        
    participants_info = ", ".join([
        f"{p.ai_name if p.is_ai else 'Human User'} (Role: {p.role or 'None'})" 
        for p in room.participants
    ])
    
    ai_service = AIService()
    message = await ai_service.generate_icebreaker_message(
        chat_context=room.context or "General conversation",
        vocabulary=payload.vocabulary_words,
        language=payload.language,
        participants_info=participants_info,
        ai_language=payload.ai_language
    )
    return {"status": True, "message": message}

@router.post("/grammar-check")
@limiter.limit("5/minute")
async def check_grammar(
    request: Request,
    payload: GrammarCheckRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    from app.services.usage_service import check_and_increment_limit
    check_and_increment_limit(db, current_user, "daily_chat_grammar_corrections")

    ai_service = AIService()
    prompt = get_grammar_check_prompt(payload.message, payload.language, payload.ai_language)
    system_prompt = get_grammar_check_system_prompt(payload.ai_language)

    try:
        response_str = await ai_service._call_llm(
            prompt=prompt,
            system_prompt=system_prompt,
            json_format=True,
            temp=0.3
        )
        data = json.loads(response_str)
        return {"status": True, "data": data}
    except Exception as e:
        return {"status": False, "message": str(e)}

@router.post("/grammar-summary")
@limiter.limit("5/minute")
async def get_grammar_summary(
    request: Request,
    payload: GrammarSummaryRequest,
    current_user: User = Depends(get_current_user)
):
    ai_service = AIService()
    corrections_text = json.dumps(payload.corrections, ensure_ascii=False, indent=2)
    prompt = f"The user has finished a conversation in {payload.language}. Here are the grammar corrections made during the chat:\n{corrections_text}\n\nPlease generate a summary of their grammar, how much of the language was used correctly, statistics (e.g. number of mistakes, common error types), improvements, and the list of corrections. Return the output as HTML or formatted text suitable for a UI."
    system_prompt = f"You are an expert language teacher in {payload.language}. Provide the response in {payload.ai_language}. Be encouraging and constructive."

    try:
        response_str = await ai_service._call_llm(
            prompt=prompt,
            system_prompt=system_prompt,
            json_format=False,
            temp=0.4
        )
        return {"status": True, "summary": response_str}
    except Exception as e:
        return {"status": False, "message": str(e)}

@router.post("/pronunciation-help")
@limiter.limit("10/minute")
async def get_pronunciation_help(
    request: Request,
    payload: PronunciationHelpRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    from app.services.usage_service import check_and_increment_limit
    # the user asked for audio with TTS natively if limit is passed.
    # we can intercept this or handle it gracefully.
    # We will raise HTTP 429 and let the frontend catch it to use native TTS.
    check_and_increment_limit(db, current_user, "daily_ai_pronunciation")
    
    ai_service = AIService()
    prompt = get_pronunciation_prompt(
        text=payload.text,
        language=payload.language,
        phonetics_style=payload.phonetics_style,
        native_language=payload.native_language
    )
    system_prompt = get_pronunciation_system_prompt()

    try:
        response_str = await ai_service._call_llm(
            prompt=prompt,
            system_prompt=system_prompt,
            json_format=True,
            temp=0.1
        )
        data = json.loads(response_str)
        return {"status": True, "data": data}
    except Exception as e:
        return {"status": False, "message": str(e)}

# --- AI Personas Endpoints ---

@router.get("/ai-personas")
def get_ai_personas(
    request: Request,
    current_user: User = Depends(get_current_user),
    service: ChatService = Depends(get_chat_service)
):
    return service.get_ai_personas(current_user.id)

@router.post("/ai-personas")
@limiter.limit("10/minute")
def create_ai_persona(
    request: Request,
    data: AIPersonaCreate,
    current_user: User = Depends(get_current_user),
    service: ChatService = Depends(get_chat_service)
):
    from app.core.config_limits import get_user_limit
    limit = get_user_limit(current_user.subscription_tier, "max_ai_companions")
    if limit != -1:
        personas = service.get_ai_personas(current_user.id)
        if len(personas) >= limit:
            from fastapi import HTTPException, status
            raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail=f"Límite de {limit} compañeros AI alcanzado.")
            
    return service.create_ai_persona(current_user.id, data)

@router.put("/ai-personas/{persona_id}")
@limiter.limit("10/minute")
def update_ai_persona(
    request: Request,
    persona_id: int,
    data: AIPersonaUpdate,
    current_user: User = Depends(get_current_user),
    service: ChatService = Depends(get_chat_service)
):
    return service.update_ai_persona(persona_id, current_user.id, data)

@router.delete("/ai-personas/{persona_id}")
@limiter.limit("10/minute")
def delete_ai_persona(
    request: Request,
    persona_id: int,
    current_user: User = Depends(get_current_user),
    service: ChatService = Depends(get_chat_service)
):
    return service.delete_ai_persona(persona_id, current_user.id)