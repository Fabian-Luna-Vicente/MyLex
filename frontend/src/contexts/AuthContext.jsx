import { createContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      // Intentamos refrescar o verificar sesión. Podrías tener un endpoint /auth/me en el backend.
      // Si no existe, podemos forzar un refresh simulado o usar userInfo guardado.
      // Para este caso, asumimos que si el auth:logout no se disparó, y tenemos info guardada, estamos logueados.
      const storedUser = localStorage.getItem('mylex_user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();

    const handleLogoutEvent = () => {
      logout();
    };
    
    // Escuchar el evento de token expirado desde api.js
    window.addEventListener('auth:logout', handleLogoutEvent);
    return () => window.removeEventListener('auth:logout', handleLogoutEvent);
  }, [checkAuth]);

  const loginWithGoogle = async (googleIdToken) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/google_login', { id_token: googleIdToken });
      if (response.data.status) {
        const userData = response.data.user;
        setUser(userData);
        localStorage.setItem('mylex_user', JSON.stringify(userData));
        return { success: true };
      }
      return { success: false, message: 'Fallo al iniciar sesión con Google.' };
    } catch (error) {
      return { success: false, message: error.response?.data?.detail || 'Error en el servidor.' };
    } finally {
      setLoading(false);
    }
  };

  const loginWithEmail = async (email, password) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.status) {
        const userData = response.data.user;
        setUser(userData);
        localStorage.setItem('mylex_user', JSON.stringify(userData));
        return { success: true };
      }
      return { success: false, message: 'Fallo al iniciar sesión.' };
    } catch (error) {
      return { success: false, message: error.response?.data?.detail || 'Error en el servidor.' };
    } finally {
      setLoading(false);
    }
  };

  const registerUser = async (email, name, password) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/register', { email, name, password });
      return { success: true, message: response.data.detail };
    } catch (error) {
      return { success: false, message: error.response?.data?.detail || 'Error en el registro.' };
    } finally {
      setLoading(false);
    }
  };

  const verifyEmail = async (token) => {
    try {
      const response = await api.post('/auth/verify-email', { token });
      return { success: true, message: response.data.detail };
    } catch (error) {
      return { success: false, message: error.response?.data?.detail || 'Fallo al verificar el correo.' };
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await api.post('/auth/logout');
    } catch (e) {
      console.error("Error logging out", e);
    } finally {
      setUser(null);
      localStorage.removeItem('mylex_user');
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, loginWithEmail, registerUser, verifyEmail, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
