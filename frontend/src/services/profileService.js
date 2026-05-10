import api from './api';

export const profileService = {
  getMyProfile: async () => {
    const response = await api.get('/api/profile/me');
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await api.put('/api/profile/me', data);
    return response.data;
  },

  getUserProfile: async (userId) => {
    const response = await api.get(`/api/profile/${userId}`);
    return response.data;
  },

  searchUsers: async (query) => {
    const response = await api.get('/api/profile/search/users', { params: { q: query } });
    return response.data;
  },

  sendFriendRequest: async (receiverId) => {
    const response = await api.post('/api/friends/request', { receiver_id: receiverId });
    return response.data;
  },

  respondToRequest: async (requestId, action) => {
    const response = await api.put(`/api/friends/request/${requestId}`, { action });
    return response.data;
  },

  getPendingRequests: async () => {
    const response = await api.get('/api/friends/requests');
    return response.data;
  },

  getFriends: async () => {
    const response = await api.get('/api/friends');
    return response.data;
  },

  removeFriend: async (friendId) => {
    const response = await api.delete(`/api/friends/${friendId}`);
    return response.data;
  },
};
