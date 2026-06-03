import re
from sqlalchemy.orm import Session
from datetime import date
from app.repositories.chat_repository import ChatRepository
from app.repositories.profile_repository import ProfileRepository
from app.services.ai_service import AIService
from app.schemas.chat import ChatMessageResponse, ChatRoomResponse, ChatRoomCreate, ChatParticipantCreate, ChatParticipantResponse
from app.graph.builder import build_chat_graph
from app.graph.state import ChatState, AIParticipant, HumanParticipant, ChatMessagePayload
from app.core.redis_chat import get_cached_history, cache_new_message
from app.core.exceptions import ResourceNotFoundError, PermissionDeniedError
import re

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
            raise ResourceNotFoundError("Room not found")
            
        if not any(p.user_id == user_id for p in room.participants):
            raise PermissionDeniedError("Not a participant")
            
        room = self.repo.update_room(room_id, name, description, context)
        return self._map_room(room)

    def leave_room(self, room_id: int, user_id: str):
        room = self.repo.get_room_by_id(room_id)
        if not room:
            raise ResourceNotFoundError("Room not found")

        participant = next((p for p in room.participants if p.user_id == user_id), None)
        if not participant:
            raise PermissionDeniedError("Not a participant")

        self.repo.remove_participant(participant.id)

        # Re-fetch room or check remaining participants to see if any humans are left
        human_participants_left = [p for p in room.participants if not p.is_ai and p.id != participant.id]
        
        if not human_participants_left:
            self.repo.delete_room(room_id)
            return {"status": True, "detail": "Left and room deleted"}
        
        return {"status": True, "detail": "Left room successfully"}

    def add_participant(self, room_id: int, user_id: str, data: ChatParticipantCreate):
        room = self.repo.get_room_by_id(room_id)
        if not room:
            raise ResourceNotFoundError("Room not found")
        if not any(p.user_id == user_id for p in room.participants):
            raise PermissionDeniedError("Not a participant")
            
        p = self.repo.add_participant(room_id, data)
        return self._map_participant(p)

    def get_room_messages(self, room_id: int, user_id: str, limit: int = 50, offset: int = 0):
        room = self.repo.get_room_by_id(room_id)
        if not room:
            raise ResourceNotFoundError("Room not found")
        if not any(p.user_id == user_id for p in room.participants):
            raise PermissionDeniedError("Not a participant in this room")
            
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
            raise ResourceNotFoundError("Room not found")
        if not any(p.user_id == user_id for p in room.participants):
            raise PermissionDeniedError("Not a participant")
            
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
            raise ResourceNotFoundError("Room not found")
            
        participant = next((p for p in room.participants if p.user_id == user_id), None)
        if not participant:
            raise PermissionDeniedError("Not a participant")
        
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

    async def send_ai_message(self, room_id: int, user_id: str, content: str, context_words: list[str] = None, mentioned_ai_participant_ids: list[int] = None, ai_language: str = "es", background_tasks = None):
        room = self.repo.get_room_by_id(room_id)
        if not room:
            raise ResourceNotFoundError("Room not found")
            
        user_participant = next((p for p in room.participants if p.user_id == user_id), None)
        if not user_participant:
            raise PermissionDeniedError("Not a participant")

        message_history = await get_cached_history(room_id, self.repo)
            
        user_msg = self.repo.create_message(room_id, user_participant.id, content, "text")
        self._check_and_update_vocab_usage(room_id, user_id, content)

        user_payload = ChatMessagePayload(
            message_id=user_msg.id,
            sender_participant_id=user_msg.participant_id,
            sender_name="User",
            is_ai=False,
            content=user_msg.content,
            timestamp=user_msg.created_at.isoformat()
        )
        await cache_new_message(room_id, user_payload)
        message_history.append(user_payload)
        
        if len(message_history) > 10:
            message_history = message_history[-10:]
        
        if mentioned_ai_participant_ids is None:
            mentioned_ai_participant_ids = []
            
        detected_mentions = set()
        for w in content.split():
            if w.startswith('@') and len(w) > 1:
                clean_name = re.sub(r'[^\w\s]', '', w[1:]).lower()
                detected_mentions.add(clean_name)
                
        for p in room.participants:
            if p.is_ai and p.ai_name:
                ai_first_name = p.ai_name.split()[0].lower()
                if ai_first_name in detected_mentions or p.ai_name.lower() in detected_mentions:
                    if p.id not in mentioned_ai_participant_ids:
                        mentioned_ai_participant_ids.append(p.id)
        
        ai_participants_state = []
        for p in room.participants:
            if p.is_ai:
                ai_participants_state.append(AIParticipant(
                    participant_id=p.id,
                    persona_id=None,
                    name=p.ai_name or "AI",
                    role_prompt=p.role or "",
                    description=p.ai_personality or "",
                    example_responses=[]
                ))
                
        human_participants_state = []
        for p in room.participants:
            if not p.is_ai:
                human_participants_state.append(HumanParticipant(
                    participant_id=p.id,
                    user_id=p.user_id,
                    name="Human" 
                ))

        vocab_targets = []
        if context_words:
            for cw in context_words:
                vocab_targets.append({"name": cw})

        initial_state = ChatState(
            room_id=room_id,
            conversation_language=room.language or "en",
            room_context=room.context or "General conversation",
            room_summary=room.summary,
            mentioned_ai_participant_ids=mentioned_ai_participant_ids,
            human_participants=human_participants_state,
            ai_participants=ai_participants_state,
            message_history=message_history, 
            new_messages=[],
            vocabulary_targets=vocab_targets,
            ai_respondents_queue=[],
            current_ai_index=0,
            current_draft="",
            correction_attempts=0,
            max_correction_attempts=2,
            last_review=None,
            typing_delay_seconds=0.0,
            pending_human_messages=[],
            should_interrupt=False,
            thread_id=str(room_id),
            sent_messages=[],
            ai_language=ai_language
        )

        graph = build_chat_graph(self.ai_service, self.repo)
        result_state = await graph.ainvoke(initial_state)

        responses = []
        responses.append(ChatMessageResponse(**{
            "id": user_msg.id, "room_id": user_msg.room_id, "participant_id": user_msg.participant_id,
            "content": user_msg.content, "message_type": user_msg.message_type, "created_at": user_msg.created_at,
            "participant": self._map_participant(user_msg.participant)
        }))

        for m in result_state.get("sent_messages", []):
            if m.get("message_id"):
                saved_db_msg = self.repo.get_message_by_id(m["message_id"])
                if saved_db_msg:
                    # --- REDIS ---
                    ai_payload = ChatMessagePayload(
                        message_id=saved_db_msg.id,
                        sender_participant_id=saved_db_msg.participant_id,
                        sender_name=saved_db_msg.participant.ai_name,
                        is_ai=True,
                        content=saved_db_msg.content,
                        timestamp=saved_db_msg.created_at.isoformat()
                    )
                    await cache_new_message(room_id, ai_payload)
                    # ----------------------------

                    responses.append(ChatMessageResponse(**{
                        "id": saved_db_msg.id, "room_id": saved_db_msg.room_id, "participant_id": saved_db_msg.participant_id,
                        "content": saved_db_msg.content, "message_type": saved_db_msg.message_type, "created_at": saved_db_msg.created_at,
                        "participant": self._map_participant(saved_db_msg.participant)
                    }))

        if background_tasks:
            background_tasks.add_task(self._summarize_background, room_id)

        return responses

    async def _summarize_background(self, room_id: int):
        from app.core.database import SessionLocal
        db = SessionLocal()
        try:
            repo = ChatRepository(db)
            room = repo.get_room_by_id(room_id)
            if not room: return
            
            unsummarized = repo.get_unsummarized_messages(room_id, room.last_summarized_message_id, limit=20)
            if len(unsummarized) < 10:
                return 
                
            chat_log = "\n".join([f"{m.participant.ai_name if m.participant.is_ai else 'User'}: {m.content}" for m in unsummarized])
            prompt = f"Previous summary: {room.summary or 'None'}\n\nRecent messages:\n{chat_log}\n\nProvide a concise updated summary of the entire conversation. Do not write anything else besides the summary."
            
            ai_service = AIService()
            new_summary = await ai_service._call_llm(prompt, "You are a helpful assistant that summarizes conversations concisely.", json_format=False, temp=0.2)
            
            repo.update_room_summary(room_id, new_summary, unsummarized[-1].id)
        except Exception as e:
            print(f"Error summarizer background task: {e}")
        finally:
            db.close()

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
            raise ResourceNotFoundError("Persona not found")
        if persona.user_id != user_id:
            raise PermissionDeniedError("Not authorized")
        return self.repo.update_ai_persona(persona_id, data)

    def delete_ai_persona(self, persona_id: int, user_id: str):
        persona = self.repo.get_ai_persona_by_id(persona_id)
        if not persona:
            raise ResourceNotFoundError("Persona not found")
        if persona.user_id != user_id:
            raise PermissionDeniedError("Not authorized")
        self.repo.delete_ai_persona(persona_id)
        return {"status": True, "detail": "Persona deleted"}

