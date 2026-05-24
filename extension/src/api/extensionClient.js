import axios from "axios";
import { CONFIG } from "../config/constants";

const BASE_URL = CONFIG.API_BASE_URL;

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(async (config) => {
  const result = await chrome.storage.local.get(['access_token']);
  if (result.access_token) {
    config.headers.Authorization = `Bearer ${result.access_token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const response = await axios.post(`${BASE_URL}/auth/refresh`, {}, { withCredentials: true });

        if (response.data.status && response.data.access_token) {
          const newToken = response.data.access_token;

          await chrome.storage.local.set({ access_token: newToken });

          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error("Refresh token expired or invalid", refreshError);
        await chrome.storage.local.remove(['access_token']);
      }
    }

    return Promise.reject(error);
  }
);

export default api;