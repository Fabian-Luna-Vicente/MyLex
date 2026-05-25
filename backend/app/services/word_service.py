from app.schemas.vocabulary import WordCreate, WordUpdate

class WordService:
    def __init__(self, word_repo, list_repo):
        self.repo = word_repo
        self.list_repo = list_repo

    def create_word(self, user_id: str, word_in: WordCreate):
        lists = None
        if word_in.list_ids:
            lists = self.list_repo.get_lists_by_ids(word_in.list_ids, user_id)
        return self.repo.create_word(user_id, word_in, lists)

    def get_words(self, user_id: str, search: str = None):
        return self.repo.get_words_by_user(user_id, search)

    def get_word(self, word_id: int, user_id: str):
        return self.repo.get_word(word_id, user_id)

    def update_word(self, word_id: int, user_id: str, word_in: WordUpdate):
        lists = None
        if word_in.list_ids is not None:
            lists = self.list_repo.get_lists_by_ids(word_in.list_ids, user_id)
        return self.repo.update_word(word_id, user_id, word_in, lists)

    def delete_word(self, word_id: int, user_id: str):
        return self.repo.delete_word(word_id, user_id)
