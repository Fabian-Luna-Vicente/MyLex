import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

export function useForgotPassword() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    try {
      const res = await authService.forgotPassword(email);
      setStatus('success');
      setMessage(res.detail || "If the email is registered, a password reset link has been sent.");
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.detail || "An error occurred. Please try again.");
    }
  };

  return {
    email,
    setEmail,
    status,
    message,
    navigate,
    handleSubmit
  };
}
