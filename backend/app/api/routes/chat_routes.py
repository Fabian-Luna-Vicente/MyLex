import json
from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user, get_current_user_ws
from app.models.user import User
from app.services.chat_service import ChatService
from app.schemas.chat import ChatRoomCreate, RoomVocabularyListCreate, AIChatRequest

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

@router.post("/rooms/ai")
def get_or_create_ai_room(
    current_user: User = Depends(get_current_user),
    service: ChatService = Depends(get_chat_service)
):
    return service.get_or_create_ai_room(current_user.id)

@router.post("/rooms/human")
def get_or_create_human_room(
    data: ChatRoomCreate,
    current_user: User = Depends(get_current_user),
    service: ChatService = Depends(get_chat_service)
):
    return service.get_or_create_human_room(current_user.id, data.user2_id)

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
    current_user: User = Depends(get_current_user),
    service: ChatService = Depends(get_chat_service)
):
    return await service.send_ai_message(data.room_id, current_user.id, data.message, context_words=data.context_words)

# --- WebSocket Endpoint for Human Chat ---

@router.websocket("/ws/{room_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    room_id: int,
    token: str,
    db: Session = Depends(get_db)
):
    user = await get_current_user_ws(token, db)
    if not user:
        await websocket.close(code=1008)
        return
        
    service = ChatService(db)
    # verify user belongs to room
    try:
        room = service.repo.get_room_by_id(room_id)
        if not room or user.id not in [room.user1_id, room.user2_id]:
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
