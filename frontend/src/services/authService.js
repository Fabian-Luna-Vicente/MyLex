import api from './api';

export const authService = {
  loginWithGoogle: async (googleIdToken) => {
    const response = await api.post('/auth/google_login', { id_token: googleIdToken });
    return response.data;
  },
  
  loginWithEmail: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  
  registerUser: async (email, name, password) => {
    const response = await api.post('/auth/register', { email, name, password });
    return response.data;
  },
  
  verifyEmail: async (token) => {
    const response = await api.post('/auth/verify-email', { token });
    return response.data;
  },
  
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token, newPassword) => {
    const response = await api.post('/auth/reset-password', {
      token: token,
      new_password: newPassword
    });
    return response.data;
  }
};
