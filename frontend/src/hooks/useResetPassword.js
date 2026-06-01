import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';

export function useResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [message, setMessage] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();
  const token = new URLSearchParams(location.search).get('token');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage("Invalid or missing password reset token.");
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return;
    
    if (password !== confirmPassword) {
      setStatus('error');
      setMessage("Passwords do not match.");
      return;
    }
    
    if (password.length < 6) {
      setStatus('error');
      setMessage("Password must be at least 6 characters long.");
      return;
    }

    setStatus('loading');
    try {
      const res = await authService.resetPassword(token, password);
      setStatus('success');
      setMessage(res.detail || "Password reset successfully!");
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.detail || "An error occurred. The token might have expired.");
    }
  };

  return {
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    status,
    message,
    navigate,
    token,
    handleSubmit
  };
}
