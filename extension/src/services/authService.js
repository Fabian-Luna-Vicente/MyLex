import { CONFIG } from "../config/constants";

export const authService = {
    login: async (email, password) => {
        const response = await fetch(`${CONFIG.API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        const data = await response.json();
        if (response.ok && data.access_token) {
            return data;
        } else {
            throw new Error(data.detail || 'Login failed');
        }
    },

    setToken: (token) => {
        return new Promise((resolve) => {
            chrome.runtime.sendMessage({ 
                action: "SET_TOKEN", 
                token: token 
            }, () => {
                resolve();
            });
        });
    }
};
