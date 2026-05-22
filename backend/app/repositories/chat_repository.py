from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, and_, desc
from app.models.chat import ChatRoom, ChatMessage, RoomVocabularyList, WordUsageDaily, ChatParticipant, AIPersona
from app.models.vocabulary import VocabularyList, Word
from app.models.user import User
from app.models.profile import UserProfile
from app.schemas.chat import ChatRoomCreate, ChatParticipantCreate, AIPersonaCreate, AIPersonaUpdate
from datetime import date

class ChatRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_user_rooms(self, user_id: str):
        return self.db.query(ChatRoom).join(ChatParticipant).filter(
            ChatParticipant.user_id == user_id
        ).order_by(desc(ChatRoom.created_at)).all()

    def get_room_by_id(self, room_id: int) -> ChatRoom:
        return self.db.query(ChatRoom).options(joinedload(ChatRoom.participants)).filter(ChatRoom.id == room_id).first()

    def create_room(self, creator_id: str, data: ChatRoomCreate) -> ChatRoom:
        room = ChatRoom(
            name=data.name,
            description=data.description,
            context=data.context,
            language=data.language,
            created_by=creator_id
        )
        self.db.add(room)
        self.db.commit()
        self.db.refresh(room)

        # Add the creator as a participant automatically if not in the initial list
        creator_included = any(p.user_id == creator_id for p in data.initial_participants)
        if not creator_included:
            p = ChatParticipant(
                room_id=room.id,
                user_id=creator_id,
                is_ai=False,
                role="Admin/Creator"
            )
            self.db.add(p)
            
        for p_data in data.initial_participants:
            p = ChatParticipant(
                room_id=room.id,
                user_id=p_data.user_id,
                is_ai=p_data.is_ai,
                ai_name=p_data.ai_name,
                ai_gender=p_data.ai_gender,
                ai_personality=p_data.ai_personality,
                ai_avatar_url=p_data.ai_avatar_url,
                role=p_data.role
            )
            self.db.add(p)
            
        self.db.commit()
        self.db.refresh(room)
        return room

    def update_room(self, room_id: int, name: str = None, description: str = None, context: str = None):
        room = self.get_room_by_id(room_id)
        if room:
            if name is not None: room.name = name
            if description is not None: room.description = description
            if context is not None: room.context = context
            self.db.commit()
            self.db.refresh(room)
        return room

    def delete_room(self, room_id: int):
        room = self.get_room_by_id(room_id)
        if room:
            self.db.delete(room)
            self.db.commit()

    def update_room_summary(self, room_id: int, summary: str, last_message_id: int):
        room = self.get_room_by_id(room_id)
        if room:
            room.summary = summary
            room.last_summarized_message_id = last_message_id
            self.db.commit()
            self.db.refresh(room)
        return room

    def add_participant(self, room_id: int, data: ChatParticipantCreate) -> ChatParticipant:
        p = ChatParticipant(
            room_id=room_id,
            user_id=data.user_id,
            is_ai=data.is_ai,
            ai_name=data.ai_name,
            ai_gender=data.ai_gender,
            ai_personality=data.ai_personality,
            ai_avatar_url=data.ai_avatar_url,
            role=data.role
        )
        self.db.add(p)
        self.db.commit()
        self.db.refresh(p)
        return p

    def get_participant_by_id(self, participant_id: int) -> ChatParticipant:
        return self.db.query(ChatParticipant).filter(ChatParticipant.id == participant_id).first()

    def update_participant(self, participant_id: int, role: str = None, ai_name: str = None, ai_personality: str = None):
        p = self.get_participant_by_id(participant_id)
        if p:
            if role is not None: p.role = role
            if ai_name is not None and p.is_ai: p.ai_name = ai_name
            if ai_personality is not None and p.is_ai: p.ai_personality = ai_personality
            self.db.commit()
            self.db.refresh(p)
        return p

    def remove_participant(self, participant_id: int):
        p = self.get_participant_by_id(participant_id)
        if p:
            self.db.delete(p)
            self.db.commit()

    def get_messages(self, room_id: int, limit: int = 50, offset: int = 0):
        return self.db.query(ChatMessage).options(joinedload(ChatMessage.participant)).filter(
            ChatMessage.room_id == room_id
        ).order_by(desc(ChatMessage.created_at)).offset(offset).limit(limit).all()

    def get_unsummarized_messages(self, room_id: int, start_id: int, limit: int = 50):
        query = self.db.query(ChatMessage).options(joinedload(ChatMessage.participant)).filter(
            ChatMessage.room_id == room_id
        )
        if start_id:
            query = query.filter(ChatMessage.id > start_id)
        return query.order_by(ChatMessage.id.asc()).limit(limit).all()

    def get_message_by_id(self, message_id: int) -> ChatMessage:
        return self.db.query(ChatMessage).options(joinedload(ChatMessage.participant)).filter(
            ChatMessage.id == message_id
        ).first()

    def create_message(self, room_id: int, participant_id: int, content: str, message_type: str = "text") -> ChatMessage:
        msg = ChatMessage(
            room_id=room_id,
            participant_id=participant_id,
            content=content,
            message_type=message_type
        )
        self.db.add(msg)
        self.db.commit()
        self.db.refresh(msg)
        
        # Load participant for response rendering
        return self.db.query(ChatMessage).options(joinedload(ChatMessage.participant)).filter(ChatMessage.id == msg.id).first()

    def link_list_to_room(self, room_id: int, list_id: int, user_id: str) -> RoomVocabularyList:
        existing = self.db.query(RoomVocabularyList).filter(
            RoomVocabularyList.room_id == room_id,
            RoomVocabularyList.list_id == list_id
        ).first()
        if existing:
            return existing
            
        link = RoomVocabularyList(room_id=room_id, list_id=list_id, user_id=user_id)
        self.db.add(link)
        self.db.commit()
        self.db.refresh(link)
        return link

    def get_linked_lists_for_room(self, room_id: int):
        links = self.db.query(RoomVocabularyList).filter(RoomVocabularyList.room_id == room_id).all()
        lists_data = []
        for link in links:
            vocab_list = self.db.query(VocabularyList).filter(VocabularyList.id == link.list_id).first()
            if vocab_list:
                words = self.db.query(Word).filter(Word.lists.any(id=vocab_list.id)).all()
                lists_data.append({
                    "list": vocab_list,
                    "words": words,
                    "linked_by": link.user_id
                })
        return lists_data
        
    def get_daily_word_usages(self, user_id: str, target_date: date):
        return self.db.query(WordUsageDaily).filter(
            WordUsageDaily.user_id == user_id,
            WordUsageDaily.date == target_date
        ).all()

    def update_word_usage(self, user_id: str, word_id: int):
        today = date.today()
        usage = self.db.query(WordUsageDaily).filter(
            WordUsageDaily.user_id == user_id,
            WordUsageDaily.word_id == word_id,
            WordUsageDaily.date == today
        ).first()

        if usage:
            usage.usage_count += 1
        else:
            usage = WordUsageDaily(user_id=user_id, word_id=word_id, date=today, usage_count=1)
            self.db.add(usage)
            
        self.db.commit()
        self.db.refresh(usage)
        return usage

    # --- AIPersona Methods ---
    def get_user_ai_personas(self, user_id: str):
        return self.db.query(AIPersona).filter(AIPersona.user_id == user_id).all()

    def get_ai_persona_by_id(self, persona_id: int) -> AIPersona:
        return self.db.query(AIPersona).filter(AIPersona.id == persona_id).first()

    def create_ai_persona(self, user_id: str, data: AIPersonaCreate) -> AIPersona:
        persona = AIPersona(
            user_id=user_id,
            name=data.name,
            gender=data.gender,
            personality=data.personality,
            avatar_url=data.avatar_url
        )
        self.db.add(persona)
        self.db.commit()
        self.db.refresh(persona)
        return persona

    def update_ai_persona(self, persona_id: int, data: AIPersonaUpdate) -> AIPersona:
        persona = self.get_ai_persona_by_id(persona_id)
        if persona:
            if data.name is not None: persona.name = data.name
            if data.gender is not None: persona.gender = data.gender
            if data.personality is not None: persona.personality = data.personality
            if data.avatar_url is not None: persona.avatar_url = data.avatar_url
            self.db.commit()
            self.db.refresh(persona)
        return persona

    def delete_ai_persona(self, persona_id: int):
        persona = self.get_ai_persona_by_id(persona_id)
        if persona:
            self.db.delete(persona)
            self.db.commit()

