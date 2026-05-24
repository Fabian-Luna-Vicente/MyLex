import { useState } from 'react';
import { authService } from '../services/authService';

export const useAuth = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const login = async (email, password, onSuccess) => {
        setLoading(true);
        setError('');

        try {
            const data = await authService.login(email, password);
            await authService.setToken(data.access_token);
            if (onSuccess) onSuccess();
        } catch (err) {
            setError(err.message || 'Connection error');
        } finally {
            setLoading(false);
        }
    };

    return {
        login,
        loading,
        error
    };
};
