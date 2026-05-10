import re
from fastapi import HTTPException
from sqlalchemy.orm import Session
from datetime import date
from app.repositories.chat_repository import ChatRepository
from app.repositories.profile_repository import ProfileRepository
from app.services.ai_service import AIService
from app.schemas.chat import ChatMessageResponse, ChatRoomResponse

class ChatService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = ChatRepository(db)
        self.profile_repo = ProfileRepository(db)
        self.ai_service = AIService()

    def get_user_rooms(self, user_id: str) -> list[ChatRoomResponse]:
        rooms = self.repo.get_user_rooms(user_id)
        result = []
        for room in rooms:
            partner_name = "AI Tutor"
            partner_avatar = ""
            
            if not room.is_ai_chat:
                partner_id = room.user2_id if room.user1_id == user_id else room.user1_id
                partner_profile = self.profile_repo.get_or_create_profile(partner_id)
                partner_user = self.profile_repo.get_user_by_id(partner_id)
                if partner_user:
                    partner_name = partner_user.name
                if partner_profile and partner_profile.avatar_url:
                    partner_avatar = partner_profile.avatar_url

            result.append(ChatRoomResponse(
                id=room.id,
                is_ai_chat=room.is_ai_chat,
                user1_id=room.user1_id,
                user2_id=room.user2_id,
                human_user_id=room.human_user_id,
                created_at=room.created_at,
                partner_name=partner_name,
                partner_avatar=partner_avatar
            ))
        return result

    def get_or_create_ai_room(self, user_id: str):
        room = self.repo.get_or_create_ai_room(user_id)
        return ChatRoomResponse(
            id=room.id,
            is_ai_chat=True,
            human_user_id=user_id,
            created_at=room.created_at,
            partner_name="AI Tutor"
        )

    def get_or_create_human_room(self, user1_id: str, user2_id: str):
        if user1_id == user2_id:
            raise HTTPException(status_code=400, detail="Cannot chat with yourself")
        if not self.profile_repo.are_friends(user1_id, user2_id):
            raise HTTPException(status_code=403, detail="Must be friends to chat")
            
        room = self.repo.get_or_create_human_room(user1_id, user2_id)
        partner_profile = self.profile_repo.get_or_create_profile(user2_id)
        partner_user = self.profile_repo.get_user_by_id(user2_id)
        
        return ChatRoomResponse(
            id=room.id,
            is_ai_chat=False,
            user1_id=user1_id,
            user2_id=user2_id,
            created_at=room.created_at,
            partner_name=partner_user.name if partner_user else "Unknown",
            partner_avatar=partner_profile.avatar_url if partner_profile else ""
        )

    def get_room_messages(self, room_id: int, user_id: str, limit: int = 50, offset: int = 0):
        room = self.repo.get_room_by_id(room_id)
        if not room:
            raise HTTPException(status_code=404, detail="Room not found")
        if user_id not in [room.user1_id, room.user2_id, room.human_user_id]:
            raise HTTPException(status_code=403, detail="Not a participant in this room")
            
        msgs = self.repo.get_messages(room_id, limit, offset)
        return [ChatMessageResponse.model_validate(m) for m in msgs]

    def link_list_to_room(self, room_id: int, list_id: int, user_id: str):
        room = self.repo.get_room_by_id(room_id)
        if not room:
            raise HTTPException(status_code=404, detail="Room not found")
        if user_id not in [room.user1_id, room.user2_id, room.human_user_id]:
            raise HTTPException(status_code=403, detail="Not a participant in this room")
            
        self.repo.link_list_to_room(room_id, list_id, user_id)
        return {"status": True, "detail": "List linked successfully"}

    def get_room_vocabulary(self, room_id: int, user_id: str):
        # We need to know which words have been used today by this user
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

    def send_human_message(self, room_id: int, sender_id: str, content: str, message_type: str = "text"):
        room = self.repo.get_room_by_id(room_id)
        if not room or room.is_ai_chat:
            raise HTTPException(status_code=400, detail="Invalid human chat room")
        
        # Check vocab usage
        self._check_and_update_vocab_usage(room_id, sender_id, content)
        
        msg = self.repo.create_message(room_id, sender_id, content, message_type)
        return ChatMessageResponse.model_validate(msg)

    async def send_ai_message(self, room_id: int, sender_id: str, content: str, message_type: str = "text", context_words: list[str] = None):
        room = self.repo.get_room_by_id(room_id)
        if not room or not room.is_ai_chat:
            raise HTTPException(status_code=400, detail="Invalid AI chat room")
            
        # 1. Save User Message
        user_msg = self.repo.create_message(room_id, sender_id, content, message_type)
        
        # Check vocab usage for user
        self._check_and_update_vocab_usage(room_id, sender_id, content)
        
        # 2. Get AI Response
        ai_text = await self.ai_service.generate_chat_response(content, context_words or [])
        
        # 3. Save AI Message
        ai_msg = self.repo.create_message(room_id, None, ai_text, "text")
        
        return {
            "user_message": ChatMessageResponse.model_validate(user_msg),
            "ai_message": ChatMessageResponse.model_validate(ai_msg)
        }

    def _check_and_update_vocab_usage(self, room_id: int, user_id: str, text: str):
        linked_lists = self.repo.get_linked_lists_for_room(room_id)
        text_lower = text.lower()
        
        # Strip punctuation for exact word matching
        words_in_text = set(re.findall(r'\b\w+\b', text_lower))
        
        for lst in linked_lists:
            # We only credit the user if they linked the list OR if it's a shared room
            # Let's credit any user for any linked list word in the room
            for w in lst["words"]:
                word_clean = w.name.lower().strip()
                if word_clean in words_in_text or word_clean in text_lower:
                    self.repo.update_word_usage(user_id, w.id)
