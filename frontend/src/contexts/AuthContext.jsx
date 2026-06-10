import React, { createContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
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
    
    window.addEventListener('auth:logout', handleLogoutEvent);
    return () => window.removeEventListener('auth:logout', handleLogoutEvent);
  }, [checkAuth]);

  const loginWithGoogle = async (googleIdToken) => {
    setLoading(true);
    try {
      const data = await authService.loginWithGoogle(googleIdToken);
      if (data.status) {
        setUser(data.user);
        localStorage.setItem('mylex_user', JSON.stringify(data.user));
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
      const data = await authService.loginWithEmail(email, password);
      if (data.status) {
        setUser(data.user);
        localStorage.setItem('mylex_user', JSON.stringify(data.user));
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
      const data = await authService.registerUser(email, name, password);
      return { success: true, message: data.detail };
    } catch (error) {
      return { success: false, message: error.response?.data?.detail || 'Error en el registro.' };
    } finally {
      setLoading(false);
    }
  };

  const verifyEmail = async (token) => {
    try {
      const data = await authService.verifyEmail(token);
      return { success: true, message: data.detail };
    } catch (error) {
      return { success: false, message: error.response?.data?.detail || 'Fallo al verificar el correo.' };
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
    } catch (e) {
      console.error("Error logging out", e);
    } finally {
      setUser(null);
      localStorage.removeItem('mylex_user');
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, loginWithGoogle, loginWithEmail, registerUser, verifyEmail, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
