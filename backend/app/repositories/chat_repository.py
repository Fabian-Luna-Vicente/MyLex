from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, desc
from app.models.chat import ChatRoom, ChatMessage, RoomVocabularyList, WordUsageDaily
from app.models.vocabulary import VocabularyList, Word
from app.models.user import User
from app.models.profile import UserProfile
from datetime import date

class ChatRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_user_rooms(self, user_id: str):
        return self.db.query(ChatRoom).filter(
            or_(
                ChatRoom.user1_id == user_id,
                ChatRoom.user2_id == user_id,
                ChatRoom.human_user_id == user_id
            )
        ).order_by(desc(ChatRoom.created_at)).all()

    def get_room_by_id(self, room_id: int) -> ChatRoom:
        return self.db.query(ChatRoom).filter(ChatRoom.id == room_id).first()

    def get_or_create_ai_room(self, user_id: str) -> ChatRoom:
        room = self.db.query(ChatRoom).filter(
            ChatRoom.is_ai_chat == True,
            ChatRoom.human_user_id == user_id
        ).first()
        
        if not room:
            room = ChatRoom(is_ai_chat=True, human_user_id=user_id)
            self.db.add(room)
            self.db.commit()
            self.db.refresh(room)
        return room

    def get_or_create_human_room(self, user1_id: str, user2_id: str) -> ChatRoom:
        room = self.db.query(ChatRoom).filter(
            ChatRoom.is_ai_chat == False,
            or_(
                and_(ChatRoom.user1_id == user1_id, ChatRoom.user2_id == user2_id),
                and_(ChatRoom.user1_id == user2_id, ChatRoom.user2_id == user1_id)
            )
        ).first()

        if not room:
            room = ChatRoom(is_ai_chat=False, user1_id=user1_id, user2_id=user2_id)
            self.db.add(room)
            self.db.commit()
            self.db.refresh(room)
        return room

    def get_messages(self, room_id: int, limit: int = 50, offset: int = 0):
        return self.db.query(ChatMessage).filter(
            ChatMessage.room_id == room_id
        ).order_by(desc(ChatMessage.created_at)).offset(offset).limit(limit).all()

    def create_message(self, room_id: int, sender_id: str | None, content: str, message_type: str = "text") -> ChatMessage:
        msg = ChatMessage(
            room_id=room_id,
            sender_id=sender_id,
            content=content,
            message_type=message_type
        )
        self.db.add(msg)
        self.db.commit()
        self.db.refresh(msg)
        return msg

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
