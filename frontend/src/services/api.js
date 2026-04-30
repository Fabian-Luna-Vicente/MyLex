import axios from 'axios';

// Usamos import.meta.env en Vite para variables de entorno
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Importante para enviar cookies en cada request
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de respuesta para manejar refresh token automático
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Si recibimos un 401 (Unauthorized) y no es el request de refresh o login
    if (
      error.response?.status === 401 && 
      !originalRequest._retry && 
      !originalRequest.url.includes('/auth/login') && 
      !originalRequest.url.includes('/auth/refresh')
    ) {
      originalRequest._retry = true;
      try {
        // Intentamos refrescar el token
        await api.post('/auth/refresh');
        
        // Si el refresh es exitoso, las cookies se habrán actualizado. 
        // Reintentamos la petición original.
        return api(originalRequest);
      } catch (refreshError) {
        // Si el refresh falla (ej: expiró el refresh token), forzamos logout en el frontend
        // Emitiremos un evento personalizado para que el AuthContext lo escuche
        window.dispatchEvent(new Event('auth:logout'));
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
