import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { authService } from '../services/authService';

export default function ForgotPassword() {
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#070b14] p-4 font-sans">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[#0e0c1d] border border-white/5 rounded-[30px] p-8 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#00c3ff]/10 rounded-full blur-[80px] pointer-events-none" />

        <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Forgot Password?</h1>
        <p className="text-sm text-[#a0a0a0] mb-8 font-medium">
          Enter your email and we'll send you a link to reset your password.
        </p>

        {status === 'success' ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-[#00ff88]/10 text-[#00ff88] rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
              ✓
            </div>
            <p className="text-[#00ff88] font-bold mb-6">{message}</p>
            <button
              onClick={() => navigate('/login')}
              className="w-full py-4 rounded-2xl font-black text-sm bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all"
            >
              Return to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-[10px] font-bold text-[#a0a0a0] uppercase tracking-widest block mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-[#1a182c] border border-white/5 rounded-2xl px-5 py-4 text-white text-sm focus:border-[#00c3ff]/50 focus:shadow-[0_0_20px_rgba(0,195,255,0.15)] outline-none transition-all"
                placeholder="hello@example.com"
              />
            </div>

            {status === 'error' && (
              <p className="text-red-500 text-xs font-bold bg-red-500/10 px-4 py-3 rounded-xl border border-red-500/20">
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full py-4 rounded-2xl font-black text-sm bg-gradient-to-r from-[#00c3ff] to-[#0080ff] text-black hover:shadow-[0_0_30px_rgba(0,195,255,0.3)] transition-all disabled:opacity-50"
            >
              {status === 'loading' ? 'Sending...' : 'Send Reset Link'}
            </button>

            <button
              type="button"
              onClick={() => navigate('/login')}
              className="w-full py-3 text-[#a0a0a0] text-sm font-bold hover:text-white transition-all mt-2"
            >
              Back to Login
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
