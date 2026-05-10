import api from './api';

export const chatService = {
  getRooms: async () => {
    const response = await api.get('/api/chat/rooms');
    return response.data;
  },

  getOrCreateAIRoom: async () => {
    const response = await api.post('/api/chat/rooms/ai');
    return response.data;
  },

  getOrCreateHumanRoom: async (user2Id) => {
    const response = await api.post('/api/chat/rooms/human', { user2_id: user2Id, is_ai_chat: false });
    return response.data;
  },

  getMessages: async (roomId) => {
    const response = await api.get(`/api/chat/rooms/${roomId}/messages`);
    return response.data;
  },

  getRoomVocabulary: async (roomId) => {
    const response = await api.get(`/api/chat/rooms/${roomId}/vocabulary`);
    return response.data;
  },

  linkListToRoom: async (roomId, listId) => {
    const response = await api.post(`/api/chat/rooms/${roomId}/vocabulary`, { list_id: listId });
    return response.data;
  },

  sendAIMessage: async (roomId, message, contextWords = []) => {
    const response = await api.post('/api/chat/ai/message', { room_id: roomId, message, context_words: contextWords });
    return response.data;
  }
};
