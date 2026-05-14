import re
from fastapi import HTTPException
from sqlalchemy.orm import Session
from datetime import date
from app.repositories.chat_repository import ChatRepository
from app.repositories.profile_repository import ProfileRepository
from app.services.ai_service import AIService
from app.schemas.chat import ChatMessageResponse, ChatRoomResponse, ChatRoomCreate, ChatParticipantCreate, ChatParticipantResponse

class ChatService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = ChatRepository(db)
        self.profile_repo = ProfileRepository(db)
        self.ai_service = AIService()

    def _map_participant(self, p) -> ChatParticipantResponse:
        name_display = "Unknown"
        avatar_display = ""
        
        if p.is_ai:
            name_display = p.ai_name or "AI Assistant"
            avatar_display = p.ai_avatar_url or ""
        elif p.user_id:
            user = self.profile_repo.get_user_by_id(p.user_id)
            profile = self.profile_repo.get_or_create_profile(p.user_id)
            if user: name_display = user.name
            if profile and profile.avatar_url: avatar_display = profile.avatar_url
            
        return ChatParticipantResponse(
            id=p.id,
            room_id=p.room_id,
            user_id=p.user_id,
            role=p.role,
            is_ai=p.is_ai,
            ai_name=p.ai_name,
            ai_gender=p.ai_gender,
            ai_personality=p.ai_personality,
            name_display=name_display,
            avatar_display=avatar_display
        )

    def _map_room(self, room) -> ChatRoomResponse:
        participants = [self._map_participant(p) for p in room.participants]
        return ChatRoomResponse(
            id=room.id,
            name=room.name,
            description=room.description,
            context=room.context,
            language=room.language,
            created_by=room.created_by,
            created_at=room.created_at,
            participants=participants
        )

    def get_user_rooms(self, user_id: str) -> list[ChatRoomResponse]:
        rooms = self.repo.get_user_rooms(user_id)
        return [self._map_room(r) for r in rooms]

    def create_room(self, user_id: str, data: ChatRoomCreate):
        room = self.repo.create_room(user_id, data)
        return self._map_room(room)

    def update_room(self, room_id: int, user_id: str, name: str = None, description: str = None, context: str = None):
        room = self.repo.get_room_by_id(room_id)
        if not room:
            raise HTTPException(status_code=404, detail="Room not found")
        # Check if user is in room
        if not any(p.user_id == user_id for p in room.participants):
            raise HTTPException(status_code=403, detail="Not a participant")
            
        room = self.repo.update_room(room_id, name, description, context)
        return self._map_room(room)

    def add_participant(self, room_id: int, user_id: str, data: ChatParticipantCreate):
        room = self.repo.get_room_by_id(room_id)
        if not room:
            raise HTTPException(status_code=404, detail="Room not found")
        if not any(p.user_id == user_id for p in room.participants):
            raise HTTPException(status_code=403, detail="Not a participant")
            
        p = self.repo.add_participant(room_id, data)
        return self._map_participant(p)

    def get_room_messages(self, room_id: int, user_id: str, limit: int = 50, offset: int = 0):
        room = self.repo.get_room_by_id(room_id)
        if not room:
            raise HTTPException(status_code=404, detail="Room not found")
        if not any(p.user_id == user_id for p in room.participants):
            raise HTTPException(status_code=403, detail="Not a participant in this room")
            
        msgs = self.repo.get_messages(room_id, limit, offset)
        result = []
        for m in msgs:
            m_dict = {
                "id": m.id,
                "room_id": m.room_id,
                "participant_id": m.participant_id,
                "content": m.content,
                "message_type": m.message_type,
                "created_at": m.created_at,
                "participant": self._map_participant(m.participant) if m.participant else None
            }
            result.append(ChatMessageResponse(**m_dict))
        return result

    def link_list_to_room(self, room_id: int, list_id: int, user_id: str):
        room = self.repo.get_room_by_id(room_id)
        if not room:
            raise HTTPException(status_code=404, detail="Room not found")
        if not any(p.user_id == user_id for p in room.participants):
            raise HTTPException(status_code=403, detail="Not a participant")
            
        self.repo.link_list_to_room(room_id, list_id, user_id)
        return {"status": True, "detail": "List linked successfully"}

    def get_room_vocabulary(self, room_id: int, user_id: str):
        linked_lists = self.repo.get_linked_lists_for_room(room_id)
        usages = self.repo.get_daily_word_usages(user_id, date.today())
        used_word_ids = {u.word_id: u.usage_count for u in usages}
        
        result = []
        for lst in linked_lists:
            words = []
            for w in lst["words"]:
                words.append({
                    "id": w.id,
                    "name": w.name,
                    "meaning": w.meaning,
                    "usage_count": used_word_ids.get(w.id, 0)
                })
            result.append({
                "list_id": lst["list"].id,
                "list_name": lst["list"].name,
                "linked_by": lst["linked_by"],
                "words": words
            })
        return result

    def send_human_message(self, room_id: int, user_id: str, content: str, message_type: str = "text"):
        room = self.repo.get_room_by_id(room_id)
        if not room:
            raise HTTPException(status_code=404, detail="Room not found")
            
        participant = next((p for p in room.participants if p.user_id == user_id), None)
        if not participant:
            raise HTTPException(status_code=403, detail="Not a participant")
        
        self._check_and_update_vocab_usage(room_id, user_id, content)
        
        msg = self.repo.create_message(room_id, participant.id, content, message_type)
        m_dict = {
            "id": msg.id,
            "room_id": msg.room_id,
            "participant_id": msg.participant_id,
            "content": msg.content,
            "message_type": msg.message_type,
            "created_at": msg.created_at,
            "participant": self._map_participant(msg.participant) if msg.participant else None
        }
        return ChatMessageResponse(**m_dict)

    async def send_ai_message(self, room_id: int, user_id: str, content: str, context_words: list[str] = None, mentioned_ai_participant_ids: list[int] = None):
        room = self.repo.get_room_by_id(room_id)
        if not room:
            raise HTTPException(status_code=404, detail="Room not found")
            
        user_participant = next((p for p in room.participants if p.user_id == user_id), None)
        if not user_participant:
            raise HTTPException(status_code=403, detail="Not a participant")
            
        # 1. Save User Message
        user_msg = self.repo.create_message(room_id, user_participant.id, content, "text")
        self._check_and_update_vocab_usage(room_id, user_id, content)
        
        # 2. Determine which AIs should reply
        ais_to_reply = []
        if mentioned_ai_participant_ids:
            ais_to_reply = [p for p in room.participants if p.is_ai and p.id in mentioned_ai_participant_ids]
        else:
            # If no one mentioned, perhaps just the first AI replies, or all AIs roll a chance to reply.
            # For simplicity, we just have all AIs in the room reply if no one is explicitly mentioned,
            # or just the primary one. Let's make all AIs reply sequentially if no mention.
            ais_to_reply = [p for p in room.participants if p.is_ai]
            
        if not ais_to_reply:
            raise HTTPException(status_code=400, detail="No AI participants to reply")

        # Prepare room context for AI
        room_context = f"Room Language: {room.language}. Context: {room.context or 'General Conversation'}. "
        room_context += "Participants: " + ", ".join([f"{p.ai_name if p.is_ai else 'User'} (Role: {p.role or 'None'})" for p in room.participants])
            
        responses = []
        # Return user message formatted
        u_msg_formatted = ChatMessageResponse(**{
            "id": user_msg.id, "room_id": user_msg.room_id, "participant_id": user_msg.participant_id,
            "content": user_msg.content, "message_type": user_msg.message_type, "created_at": user_msg.created_at,
            "participant": self._map_participant(user_msg.participant)
        })
        responses.append(u_msg_formatted)

        for ai_p in ais_to_reply:
            ai_personality = f"You are {ai_p.ai_name}. Your personality is: {ai_p.ai_personality}. Your role is: {ai_p.role}."
            full_context = f"{room_context}\n{ai_personality}"
            
            ai_text = await self.ai_service.generate_chat_response(
                user_message=content,
                context_words=context_words or [],
                system_context=full_context
            )
            
            ai_msg = self.repo.create_message(room_id, ai_p.id, ai_text, "text")
            a_msg_formatted = ChatMessageResponse(**{
                "id": ai_msg.id, "room_id": ai_msg.room_id, "participant_id": ai_msg.participant_id,
                "content": ai_msg.content, "message_type": ai_msg.message_type, "created_at": ai_msg.created_at,
                "participant": self._map_participant(ai_msg.participant)
            })
            responses.append(a_msg_formatted)
            
        return responses

    def _check_and_update_vocab_usage(self, room_id: int, user_id: str, text: str):
        linked_lists = self.repo.get_linked_lists_for_room(room_id)
        text_lower = text.lower()
        
        words_in_text = set(re.findall(r'\b\w+\b', text_lower))
        
        for lst in linked_lists:
            for w in lst["words"]:
                word_clean = w.name.lower().strip()
                if word_clean in words_in_text or word_clean in text_lower:
                    self.repo.update_word_usage(user_id, w.id)

    # --- AIPersona Methods ---
    def get_ai_personas(self, user_id: str):
        return self.repo.get_user_ai_personas(user_id)

    def create_ai_persona(self, user_id: str, data):
        return self.repo.create_ai_persona(user_id, data)

    def update_ai_persona(self, persona_id: int, user_id: str, data):
        persona = self.repo.get_ai_persona_by_id(persona_id)
        if not persona:
            raise HTTPException(status_code=404, detail="Persona not found")
        if persona.user_id != user_id:
            raise HTTPException(status_code=403, detail="Not authorized")
        return self.repo.update_ai_persona(persona_id, data)

    def delete_ai_persona(self, persona_id: int, user_id: str):
        persona = self.repo.get_ai_persona_by_id(persona_id)
        if not persona:
            raise HTTPException(status_code=404, detail="Persona not found")
        if persona.user_id != user_id:
            raise HTTPException(status_code=403, detail="Not authorized")
        self.repo.delete_ai_persona(persona_id)
        return {"status": True, "detail": "Persona deleted"}

