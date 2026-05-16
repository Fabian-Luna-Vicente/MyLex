import json
from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user, get_current_user_ws
from app.models.user import User
from app.services.chat_service import ChatService
from app.schemas.chat import ChatRoomCreate, ChatRoomUpdate, RoomVocabularyListCreate, AIChatRequest, IcebreakerRequest, ChatParticipantCreate, AIPersonaCreate, AIPersonaUpdate
from app.services.ai_service import AIService

router = APIRouter()

def get_chat_service(db: Session = Depends(get_db)):
    return ChatService(db)

# --- Connection Manager ---
class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[int, list[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, room_id: int):
        await websocket.accept()
        if room_id not in self.active_connections:
            self.active_connections[room_id] = []
        self.active_connections[room_id].append(websocket)

    def disconnect(self, websocket: WebSocket, room_id: int):
        if room_id in self.active_connections:
            self.active_connections[room_id].remove(websocket)

    async def broadcast(self, message: str, room_id: int):
        if room_id in self.active_connections:
            for connection in self.active_connections[room_id]:
                await connection.send_text(message)

manager = ConnectionManager()

# --- REST Endpoints ---

@router.get("/rooms")
def get_rooms(
    current_user: User = Depends(get_current_user),
    service: ChatService = Depends(get_chat_service)
):
    return service.get_user_rooms(current_user.id)

@router.post("/rooms")
def create_room(
    data: ChatRoomCreate,
    current_user: User = Depends(get_current_user),
    service: ChatService = Depends(get_chat_service)
):
    return service.create_room(current_user.id, data)

@router.put("/rooms/{room_id}")
def update_room(
    room_id: int,
    data: ChatRoomUpdate,
    current_user: User = Depends(get_current_user),
    service: ChatService = Depends(get_chat_service)
):
    return service.update_room(room_id, current_user.id, data.name, data.description, data.context)

@router.post("/rooms/{room_id}/participants")
def add_participant(
    room_id: int,
    data: ChatParticipantCreate,
    current_user: User = Depends(get_current_user),
    service: ChatService = Depends(get_chat_service)
):
    return service.add_participant(room_id, current_user.id, data)

@router.get("/rooms/{room_id}/messages")
def get_messages(
    room_id: int,
    current_user: User = Depends(get_current_user),
    service: ChatService = Depends(get_chat_service)
):
    return service.get_room_messages(room_id, current_user.id)

@router.get("/rooms/{room_id}/vocabulary")
def get_room_vocabulary(
    room_id: int,
    current_user: User = Depends(get_current_user),
    service: ChatService = Depends(get_chat_service)
):
    return service.get_room_vocabulary(room_id, current_user.id)

@router.post("/rooms/{room_id}/vocabulary")
def link_list_to_room(
    room_id: int,
    data: RoomVocabularyListCreate,
    current_user: User = Depends(get_current_user),
    service: ChatService = Depends(get_chat_service)
):
    return service.link_list_to_room(room_id, data.list_id, current_user.id)

@router.post("/ai/message")
async def send_ai_message(
    data: AIChatRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    service: ChatService = Depends(get_chat_service)
):
    return await service.send_ai_message(
        room_id=data.room_id, 
        user_id=current_user.id, 
        content=data.message, 
        context_words=data.context_words,
        mentioned_ai_participant_ids=data.mentioned_ai_participant_ids,
        background_tasks=background_tasks
    )

# --- WebSocket Endpoint for Human Chat ---

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
    # verify user belongs to room
    try:
        room = service.repo.get_room_by_id(room_id)
        if not room or not any(p.user_id == user.id for p in room.participants):
            await websocket.close(code=1008)
            return
    except:
        await websocket.close(code=1008)
        return

    await manager.connect(websocket, room_id)
    try:
        while True:
            data_str = await websocket.receive_text()
            data = json.loads(data_str)
            content = data.get("content")
            msg_type = data.get("message_type", "text")
            
            # Save to DB and check vocab usage
            msg = service.send_human_message(room_id, user.id, content, msg_type)
            
            # Broadcast
            await manager.broadcast(json.dumps(msg.model_dump(mode='json')), room_id)
            
    except WebSocketDisconnect:
        manager.disconnect(websocket, room_id)

@router.post("/icebreaker")
async def get_icebreaker(
    payload: IcebreakerRequest,
    db: Session = Depends(get_db)
):
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
        participants_info=participants_info
    )
    return {"status": True, "message": message}

# --- AI Personas Endpoints ---

@router.get("/ai-personas")
def get_ai_personas(
    current_user: User = Depends(get_current_user),
    service: ChatService = Depends(get_chat_service)
):
    return service.get_ai_personas(current_user.id)

@router.post("/ai-personas")
def create_ai_persona(
    data: AIPersonaCreate,
    current_user: User = Depends(get_current_user),
    service: ChatService = Depends(get_chat_service)
):
    return service.create_ai_persona(current_user.id, data)

@router.put("/ai-personas/{persona_id}")
def update_ai_persona(
    persona_id: int,
    data: AIPersonaUpdate,
    current_user: User = Depends(get_current_user),
    service: ChatService = Depends(get_chat_service)
):
    return service.update_ai_persona(persona_id, current_user.id, data)

@router.delete("/ai-personas/{persona_id}")
def delete_ai_persona(
    persona_id: int,
    current_user: User = Depends(get_current_user),
    service: ChatService = Depends(get_chat_service)
):
    return service.delete_ai_persona(persona_id, current_user.id)