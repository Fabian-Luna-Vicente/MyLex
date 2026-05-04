import api from './api';

export const progressService = {
  /**
   * GET prioritized words for a game session.
   * Backend applies spaced-repetition ordering automatically.
   * @param {number} listId
   * @param {string} game - 'random' | 'hangman' | ...
   */
  getWordsForGame: async (listId, game) => {
    const response = await api.get(`/api/games/${listId}/${game}`);
    return response.data;
  },

  /**
   * Upsert progress for a single word (called during gameplay).
   * @param {{ word_id: number, game: string, difficulty?: string, is_correct?: boolean }} item
   */
  saveProgress: async (item) => {
    const response = await api.post('/api/progress', item);
    return response.data;
  },

  /**
   * Bulk upsert all progress at end of a game session.
   * More efficient than calling saveProgress one by one.
   * @param {Array<{ word_id: number, game: string, difficulty?: string, is_correct?: boolean }>} items
   */
  saveBulkProgress: async (items) => {
    const response = await api.post('/api/progress/bulk', { items });
    return response.data;
  },

  /**
   * GET all progress records for words in a specific list.
   * Used to display stats on the list detail page.
   * @param {number} listId
   */
  getListProgress: async (listId) => {
    const response = await api.get(`/api/progress/${listId}`);
    return response.data;
  },

  /**
   * GET summary stats for Dashboard.
   */
  getOverallStats: async () => {
    const response = await api.get('/api/stats/overall');
    return response.data;
  },

  /**
   * GET detailed stats with filters.
   * @param {Object} params - { game, list_id, word_type, start_date, end_date }
   */
  getDetailedStats: async (params) => {
    const response = await api.get('/api/stats/detailed', { params });
    return response.data;
  },
};
