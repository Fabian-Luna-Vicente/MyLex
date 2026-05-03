import api from './api';

export const vocabularyService = {
  // --- Words ---
  getWords: async (search = '') => {
    const response = await api.get(`/api/words${search ? `?search=${search}` : ''}`);
    return response.data;
  },
  
  addWord: async (wordData) => {
    const response = await api.post('/api/words', wordData);
    return response.data;
  },
  
  updateWord: async (wordId, wordData) => {
    const response = await api.put(`/api/words/${wordId}`, wordData);
    return response.data;
  },
  
  deleteWord: async (wordId) => {
    const response = await api.delete(`/api/words/${wordId}`);
    return response.data;
  },

  // --- Lists ---
  getLists: async () => {
    const response = await api.get('/api/lists');
    return response.data;
  },
  
  getListDetails: async (listId) => {
    const response = await api.get(`/api/lists/${listId}`);
    return response.data;
  },
  
  addList: async (listData) => {
    const response = await api.post('/api/lists', listData);
    return response.data;
  },
  
  updateList: async (listId, listData) => {
    const response = await api.put(`/api/lists/${listId}`, listData);
    return response.data;
  },
  
  deleteList: async (listId) => {
    const response = await api.delete(`/api/lists/${listId}`);
    return response.data;
  }
};
