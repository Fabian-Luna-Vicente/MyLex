import json
from fastapi import WebSocket

class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[int, list[WebSocket]] = {}
        self.user_connections: dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, room_id: int, user_id: str = None):
        if user_id:
            if user_id in self.user_connections:
                old_ws = self.user_connections[user_id]
                try:
                    await old_ws.send_text(json.dumps({
                        "type": "system_error", 
                        "message": "Sesión iniciada en otra pestaña/navegador. Desconectando."
                    }))
                    await old_ws.close(code=4000)
                except Exception:
                    pass
                for r_id, ws_list in self.active_connections.items():
                    if old_ws in ws_list:
                        ws_list.remove(old_ws)

        await websocket.accept()
        
        if room_id not in self.active_connections:
            self.active_connections[room_id] = []
        self.active_connections[room_id].append(websocket)
        
        if user_id:
            self.user_connections[user_id] = websocket

    def disconnect(self, websocket: WebSocket, room_id: int, user_id: str = None):
        if room_id in self.active_connections:
            if websocket in self.active_connections[room_id]:
                self.active_connections[room_id].remove(websocket)
        if user_id and user_id in self.user_connections:
            if self.user_connections[user_id] == websocket:
                del self.user_connections[user_id]

    async def broadcast(self, message: str, room_id: int):
        if room_id in self.active_connections:
            for connection in self.active_connections[room_id]:
                try:
                    await connection.send_text(message)
                except Exception:
                    pass