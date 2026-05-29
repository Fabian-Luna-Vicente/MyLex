import api from './api';

export const vocabularyService = {
  // --- Words ---
  getWords: async (search = '') => {
    const response = await api.get(`/api/vocabulary/words${search ? `?search=${search}` : ''}`);
    return response.data;
  },
  getWordDetails: async (wordId) => {
    const response = await api.get(`/api/vocabulary/words/${wordId}`);
    return response.data;
  },
  addWord: async (wordData) => {
    const response = await api.post('/api/vocabulary/words', wordData);
    return response.data;
  },

  updateWord: async (wordId, wordData) => {
    const response = await api.put(`/api/vocabulary/words/${wordId}`, wordData);
    return response.data;
  },

  deleteWord: async (wordId) => {
    const response = await api.delete(`/api/vocabulary/words/${wordId}`);
    return response.data;
  },

  // --- Lists ---
  getLists: async () => {
    const response = await api.get('/api/vocabulary/lists');
    return response.data;
  },

  getUserLists: async (userId) => {
    const response = await api.get(`/api/vocabulary/users/${userId}/lists`);
    return response.data;
  },

  getListDetails: async (listId) => {
    const response = await api.get(`/api/vocabulary/lists/${listId}`);
    return response.data;
  },

  addList: async (listData) => {
    const response = await api.post('/api/vocabulary/lists', listData);
    return response.data;
  },

  updateList: async (listId, listData) => {
    const response = await api.put(`/api/vocabulary/lists/${listId}`, listData);
    return response.data;
  },

  deleteList: async (listId) => {
    const response = await api.delete(`/api/vocabulary/lists/${listId}`);
    return response.data;
  }
};
