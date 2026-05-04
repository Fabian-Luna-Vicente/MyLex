from sqlalchemy.orm import Session
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
        """
        Insert or update a progress record for a word+game combo.
        Uses PostgreSQL ON CONFLICT ... DO UPDATE for atomic upsert.
        """
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
        Returns words for the given list+game, applying spaced repetition ordering.

        - random: All words ordered by priority (due for review first), then random. Limit 20.
        - others (hangman, etc.): Exclude words answered correctly less than 2 days ago.
        """
        # Base: words in the list owned by the user
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

        if game == "random":
            # Left join with progress to get difficulty+date
            query = (
                base_query
                .outerjoin(
                    WordProgress,
                    (WordProgress.word_id == Word.id) &
                    (WordProgress.user_id == user_id) &
                    (WordProgress.game == "random"),
                )
                .add_columns(WordProgress.difficulty, WordProgress.reviewed_at)
                .order_by(
                    # Priority 1: words never reviewed OR due for review based on difficulty
                    case(
                        (WordProgress.difficulty.is_(None), 0),  # Never reviewed → highest priority
                        (
                            (WordProgress.difficulty == "easy") &
                            (func.now() - WordProgress.reviewed_at > text("INTERVAL '7 days'")),
                            0,
                        ),
                        (
                            (WordProgress.difficulty == "normal") &
                            (func.now() - WordProgress.reviewed_at > text("INTERVAL '3 days'")),
                            0,
                        ),
                        (
                            (WordProgress.difficulty == "hard") &
                            (func.now() - WordProgress.reviewed_at > text("INTERVAL '2 days'")),
                            0,
                        ),
                        (
                            (WordProgress.difficulty == "ultrahard") &
                            (func.now() - WordProgress.reviewed_at > text("INTERVAL '1 day'")),
                            0,
                        ),
                        else_=1,  # Not due yet → lower priority (filler)
                    ).asc(),
                    func.random(),  # Randomize within each priority group
                )
                .limit(20)
            )
            # Extract just the Word objects
            rows = query.all()
            return [row[0] for row in rows]

        else:
            # For hangman and other games: exclude words answered correctly in the last 2 days
            query = (
                base_query
                .outerjoin(
                    WordProgress,
                    (WordProgress.word_id == Word.id) &
                    (WordProgress.user_id == user_id) &
                    (WordProgress.game == game),
                )
                .filter(
                    (WordProgress.id.is_(None)) |  # Never played
                    (WordProgress.is_correct.is_(None)) |  # No result recorded
                    (~WordProgress.is_correct) |  # Was wrong last time
                    (func.now() - WordProgress.reviewed_at > text("INTERVAL '2 days'"))  # Answered correctly but >2 days ago
                )
                .order_by(func.random())
            )
            return query.all()

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

    def get_overall_stats(self, user_id: str):
        """
        Aggregates progress data for dashboard summary.
        - Total words mastered (Random 'easy' or Hangman 'correct')
        - Accuracy per game
        - Recent activity (reviews per day last 7 days)
        """
        # 1. Mastery distribution for Random
        random_dist = (
            self.db.query(WordProgress.difficulty, func.count(WordProgress.id))
            .filter(WordProgress.user_id == user_id, WordProgress.game == "random")
            .group_by(WordProgress.difficulty)
            .all()
        )

        # 2. Accuracy for other games
        hangman_stats = (
            self.db.query(
                func.count(WordProgress.id),
                func.sum(case((WordProgress.is_correct == True, 1), else_=0))
            )
            .filter(WordProgress.user_id == user_id, WordProgress.game == "hangman")
            .first()
        )

        # 3. Activity last 7 days
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

        return {
            "random_distribution": {d: c for d, c in random_dist},
            "hangman_stats": {
                "total": hangman_stats[0] or 0,
                "correct": int(hangman_stats[1] or 0)
            },
            "recent_activity": [{"date": a[0], "count": a[1]} for a in activity]
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
        """
        Returns a filtered list of progress records with word details.
        """
        query = (
            self.db.query(WordProgress)
            .join(Word, Word.id == WordProgress.word_id)
            .filter(WordProgress.user_id == user_id)
        )

        if game:
            query = query.filter(WordProgress.game == game)
        
        if list_id:
            query = query.join(list_word_association, list_word_association.c.word_id == Word.id) \
                         .filter(list_word_association.c.list_id == list_id)
        
        if word_type:
            # PostgreSQL ARRAY contains check
            query = query.filter(Word.word_types.any(word_type))

        if start_date:
            query = query.filter(WordProgress.reviewed_at >= start_date)
        if end_date:
            query = query.filter(WordProgress.reviewed_at <= end_date)

        return query.order_by(WordProgress.reviewed_at.desc()).all()
