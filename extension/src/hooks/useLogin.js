import { useState } from 'react';
import { useAuth } from './useAuth';

export const useLogin = (onLoginSuccess) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    await login(email, password, onLoginSuccess);
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    handleLogin,
    loading,
    error
  };
};
