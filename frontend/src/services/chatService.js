import api from './api';

export const chatService = {
  getRooms: async () => {
    const response = await api.get('/api/chat/rooms');
    return response.data;
  },

  createRoom: async (data) => {
    const response = await api.post('/api/chat/rooms', data);
    return response.data;
  },

  updateRoom: async (roomId, data) => {
    const response = await api.put(`/api/chat/rooms/${roomId}`, data);
    return response.data;
  },

  leaveRoom: async (roomId) => {
    const response = await api.delete(`/api/chat/rooms/${roomId}/leave`);
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
    const aiLanguage = localStorage.getItem('ai_language') || 'es';
    const response = await api.post('/api/chat/ai/message', { 
      room_id: roomId, 
      message, 
      context_words: contextWords,
      ai_language: aiLanguage
    });
    return response.data;
  },

  getAIPersonas: async () => {
    const response = await api.get('/api/chat/ai-personas');
    return response.data;
  },

  createAIPersona: async (data) => {
    const response = await api.post('/api/chat/ai-personas', data);
    return response.data;
  },

  deleteAIPersona: async (personaId) => {
    const response = await api.delete(`/api/chat/ai-personas/${personaId}`);
    return response.data;
  }
};
