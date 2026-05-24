from sqlalchemy.orm import Session,joinedload
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy import func, case, text
from datetime import datetime, timezone
from app.models.vocabulary import WordProgress, Word, VocabularyList, list_word_association
from app.schemas.vocabulary import ProgressUpsert
from typing import List


# Spaced repetition intervals in days (matching original Drillexa logic)
DIFFICULTY_DAYS = {
    "easy": 7,
    "normal": 3,
    "hard": 2,
    "ultrahard": 1,
}


class ProgressRepository:
    def __init__(self, db: Session):
        self.db = db

    def upsert_progress(self, user_id: str, item: ProgressUpsert) -> WordProgress:
        stmt = (
            pg_insert(WordProgress)
            .values(
                user_id=user_id,
                word_id=item.word_id,
                game=item.game,
                difficulty=item.difficulty,
                is_correct=item.is_correct,
                reviewed_at=datetime.now(timezone.utc),
            )
            .on_conflict_do_update(
                constraint="uq_user_word_game",
                set_={
                    "difficulty": item.difficulty,
                    "is_correct": item.is_correct,
                    "reviewed_at": datetime.now(timezone.utc),
                },
            )
            .returning(WordProgress)
        )
        result = self.db.execute(stmt)
        self.db.commit()
        return result.fetchone()

    def bulk_upsert_progress(self, user_id: str, items: List[ProgressUpsert]) -> int:
        """Batch upsert multiple progress records at once."""
        if not items:
            return 0
        for item in items:
            self.upsert_progress(user_id, item)
        return len(items)

    def get_words_for_game(self, user_id: str, list_id: int, game: str) -> List[Word]:
        """
        Returns words for the given list+game, applying a unified prioritization:
        1. Words answered incorrectly (Mistakes)
        2. Words answered correctly but more than 2 days ago (Due for review)
        3. New words (Never played in this game)
        
        This applies to ALL games as requested.
        """
        # Base query: words in the specific list owned by the user
        base_query = (
            self.db.query(Word)
            .join(list_word_association, list_word_association.c.word_id == Word.id)
            .join(VocabularyList, VocabularyList.id == list_word_association.c.list_id)
            .filter(
                VocabularyList.id == list_id,
                VocabularyList.user_id == user_id,
                Word.user_id == user_id,
            )
        )

        # Left join with progress for the specific game
        query = (
            base_query
            .outerjoin(
                WordProgress,
                (WordProgress.word_id == Word.id) &
                (WordProgress.user_id == user_id) &
                (WordProgress.game == game),
            )
            .add_columns(WordProgress.is_correct, WordProgress.reviewed_at, WordProgress.id.label("progress_id"))
            .order_by(
                case(
                    # Priority 1: Mistakes (is_correct is False)
                    (WordProgress.is_correct == False, 0),
                    
                    # Priority 2: Correct but more than 2 days ago
                    (
                        (WordProgress.is_correct == True) &
                        (func.now() - WordProgress.reviewed_at > text("INTERVAL '2 days'")),
                        1
                    ),
                    
                    # Priority 3: New words (No progress record)
                    (WordProgress.id.is_(None), 2),
                    
                    # Everything else (Correctly answered recently)
                    else_=3
                ).asc(),
                func.random() 
            )
        )

        if game == "random":
            query = query.limit(20) 
        
        rows = query.all()
        return [row[0] for row in rows]

    def get_progress_for_list(self, user_id: str, list_id: int) -> List[WordProgress]:
        """Returns all progress records for words in a specific list."""
        return (
            self.db.query(WordProgress)
            .join(Word, Word.id == WordProgress.word_id)
            .join(list_word_association, list_word_association.c.word_id == Word.id)
            .filter(
                list_word_association.c.list_id == list_id,
                WordProgress.user_id == user_id,
            )
            .all()
        )

    def _get_user_streak(self, user_id: str) -> int:
        # Get all unique days of activity
        query = text("""
            WITH activity_dates AS (
                SELECT DISTINCT date_trunc('day', created_at) as activity_date FROM words WHERE user_id = :user_id
                UNION
                SELECT DISTINCT date_trunc('day', reviewed_at) as activity_date FROM word_progress WHERE user_id = :user_id
            )
            SELECT activity_date FROM activity_dates ORDER BY activity_date DESC
        """)
        
        result = self.db.execute(query, {"user_id": user_id}).fetchall()
        if not result:
            return 0
        
        activity_days = [r[0].date() for r in result]
        today = datetime.now(timezone.utc).date()
        
        if activity_days[0] < today and (today - activity_days[0]).days > 1:
            return 0
            
        streak = 1
        for i in range(1, len(activity_days)):
            if (activity_days[i-1] - activity_days[i]).days == 1:
                streak += 1
            else:
                break
        
        return streak

    def get_overall_stats(self, user_id: str):
        random_dist = (
            self.db.query(WordProgress.difficulty, func.count(WordProgress.id))
            .filter(WordProgress.user_id == user_id, WordProgress.game == "random")
            .group_by(WordProgress.difficulty)
            .all()
        )

        game_stats = (
            self.db.query(
                WordProgress.game,
                VocabularyList.name.label("list_name"),
                func.count(WordProgress.id).label("total"),
                func.sum(case((WordProgress.is_correct == True, 1), else_=0)).label("correct")
            )
            .join(Word, Word.id == WordProgress.word_id)
            .join(list_word_association, list_word_association.c.word_id == Word.id)
            .join(VocabularyList, VocabularyList.id == list_word_association.c.list_id)
            .filter(WordProgress.user_id == user_id)
            .group_by(WordProgress.game, VocabularyList.name)
            .all()
        )

        activity = (
            self.db.query(
                func.date_trunc('day', WordProgress.reviewed_at).label('day'),
                func.count(WordProgress.id)
            )
            .filter(
                WordProgress.user_id == user_id,
                WordProgress.reviewed_at >= text("now() - INTERVAL '7 days'")
            )
            .group_by('day')
            .order_by('day')
            .all()
        )

        total_words = self.db.query(func.count(Word.id)).filter(Word.user_id == user_id).scalar()

        return {
            "random_distribution": {d: c for d, c in random_dist},
            "game_accuracy": [
                {
                    "game": g[0],
                    "list_name": g[1],
                    "total": g[2],
                    "correct": int(g[3] or 0),
                    "accuracy": round((int(g[3] or 0) / g[2] * 100), 1) if g[2] > 0 else 0
                } for g in game_stats if g[0] != 'random'
            ],
            "recent_activity": [{"date": a[0], "count": a[1]} for a in activity],
            "streak": self._get_user_streak(user_id),
            "total_vocabulary": total_words
        }

    def get_detailed_stats(
        self, 
        user_id: str, 
        game: str = None, 
        list_id: int = None, 
        word_type: str = None,
        start_date: datetime = None,
        end_date: datetime = None
    ):
        query = (
            self.db.query(WordProgress)
            .options(joinedload(WordProgress.word))
            .join(Word, Word.id == WordProgress.word_id)
            .filter(WordProgress.user_id == user_id)
        )

        if game:
            query = query.filter(WordProgress.game == game)
        
        if list_id:
            query = query.join(list_word_association, list_word_association.c.word_id == Word.id) \
                         .filter(list_word_association.c.list_id == list_id)
        
        if word_type:
            query = query.filter(Word.word_types.any(word_type))

        if start_date:
            query = query.filter(WordProgress.reviewed_at >= start_date)
        if end_date:
            query = query.filter(WordProgress.reviewed_at <= end_date)

        return query.order_by(WordProgress.reviewed_at.desc()).all()
