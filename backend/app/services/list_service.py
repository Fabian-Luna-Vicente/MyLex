from app.schemas.vocabulary import VocabularyListCreate, VocabularyListUpdate

class ListService:
    def __init__(self, list_repo, profile_repo):
        self.repo = list_repo
        self.profile_repo = profile_repo

    def create_list(self, user_id: str, list_in: VocabularyListCreate):
        return self.repo.create_list(user_id, list_in)

    def get_lists(self, user_id: str):
        return self.repo.get_lists_by_user(user_id)

    def get_user_lists_with_privacy(self, target_user_id: str, current_user_id: str):
        is_self = (target_user_id == current_user_id)
        is_friend = False if is_self else self.profile_repo.are_friends(target_user_id, current_user_id)
        return self.repo.get_user_lists_with_privacy(target_user_id, is_friend, is_self)

    def get_list(self, list_id: int, user_id: str):
        return self.repo.get_list_with_privacy_check(list_id, user_id)

    def update_list(self, list_id: int, user_id: str, list_in: VocabularyListUpdate):
        return self.repo.update_list(list_id, user_id, list_in)

    def delete_list(self, list_id: int, user_id: str):
        return self.repo.delete_list(list_id, user_id)

    def copy_list(self, list_id: int, user_id: str):
        return self.repo.copy_list(list_id, user_id)
