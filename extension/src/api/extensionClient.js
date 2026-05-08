import axios from "axios";

const BASE_URL = "http://localhost:8000";

const api = axios.create({
  baseURL: BASE_URL,

  withCredentials: true,

  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para agregar el token a cada petición
api.interceptors.request.use(async (config) => {
  const result = await chrome.storage.local.get(['access_token']);
  if (result.access_token) {
    config.headers.Authorization = `Bearer ${result.access_token}`;
  }
  return config;
});

export default api;