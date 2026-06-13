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

  sendAIMessage: async (roomId, message, contextWords = [], mentionedAIParticipantIds = []) => {
    const aiLanguage = localStorage.getItem('ai_language') || 'es';
    const payload = { 
      room_id: roomId, 
      message, 
      context_words: contextWords,
      ai_language: aiLanguage
    };
    if (mentionedAIParticipantIds && mentionedAIParticipantIds.length > 0) {
      payload.mentioned_ai_participant_ids = mentionedAIParticipantIds;
    }
    const response = await api.post('/api/chat/ai/message', payload);
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
  },

  getPronunciationHelp: async (text, language, phoneticsStyle, nativeLanguage) => {
    const response = await api.post('/api/chat/pronunciation-help', {
      text,
      language,
      phonetics_style: phoneticsStyle,
      native_language: nativeLanguage
    });
    return response.data;
  },

  getGrammarSummary: async (corrections, language, aiLanguage) => {
    const response = await api.post('/api/chat/grammar-summary', {
      corrections,
      language,
      ai_language: aiLanguage
    });
    return response.data;
  },

  getUsage: async () => {
    const response = await api.get('/api/profile/me/usage');
    return response.data;
  }
};
