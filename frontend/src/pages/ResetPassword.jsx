import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { authService } from '../services/authService';

export default function ResetPassword() {
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#070b14] p-4 font-sans">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[#0e0c1d] border border-white/5 rounded-[30px] p-8 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-64 h-64 bg-[#00ff88]/10 rounded-full blur-[80px] pointer-events-none" />

        <h1 className="text-3xl font-black text-[#00c3ff] mb-2 tracking-tight">Set New Password</h1>
        <p className="text-sm text-[#a0a0a0] mb-8 font-medium">
          Create a strong password for your account.
        </p>

        {status === 'success' ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-[#00ff88]/10 text-[#00ff88] rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
              ✓
            </div>
            <p className="text-[#00ff88] font-bold mb-6">{message}</p>
            <button
              onClick={() => navigate('/login')}
              className="w-full py-4 rounded-2xl font-black text-sm bg-[#00c3ff] text-black hover:shadow-[0_0_30px_rgba(0,195,255,0.3)] transition-all"
            >
              Go to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-[10px] font-bold text-[#a0a0a0] uppercase tracking-widest block mb-2">
                New Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={!token}
                className="w-full bg-[#1a182c] border border-white/5 rounded-2xl px-5 py-4 text-white text-sm focus:border-[#00ff88]/50 focus:shadow-[0_0_20px_rgba(0,255,136,0.15)] outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
            
            <div>
              <label className="text-[10px] font-bold text-[#a0a0a0] uppercase tracking-widest block mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={!token}
                className="w-full bg-[#1a182c] border border-white/5 rounded-2xl px-5 py-4 text-white text-sm focus:border-[#00ff88]/50 focus:shadow-[0_0_20px_rgba(0,255,136,0.15)] outline-none transition-all"
                placeholder="••••••••"
              />
            </div>

            {status === 'error' && (
              <p className="text-red-500 text-xs font-bold bg-red-500/10 px-4 py-3 rounded-xl border border-red-500/20">
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={status === 'loading' || !token}
              className="w-full py-4 rounded-2xl font-black text-sm bg-[#00c3ff] text-black hover:shadow-[0_0_30px_rgba(0,195,255,0.3)] transition-all disabled:opacity-50 mt-4"
            >
              {status === 'loading' ? 'Saving...' : 'Save Password'}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
