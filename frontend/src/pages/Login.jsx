import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Navigate } from 'react-router-dom';

export default function Login() {
  const { loginWithGoogle, loginWithEmail, registerUser, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    if (isRegistering) {
      if (!formData.name || !formData.email || !formData.password) {
        setError('Please fill all fields');
        setLoading(false);
        return;
      }
      const result = await registerUser(formData.email, formData.name, formData.password);
      if (result.success) {
        setSuccessMsg(result.message);
        setIsRegistering(false);
        setFormData({ ...formData, password: '' });
      } else {
        setError(result.message);
      }
    } else {
      if (!formData.email || !formData.password) {
        setError('Please enter email and password');
        setLoading(false);
        return;
      }
      const result = await loginWithEmail(formData.email, formData.password);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.message);
      }
    }
    setLoading(false);
  };

  const handleFakeGoogleLogin = async () => {
    setLoading(true);
    setError('');
    // Simula un token de google
    const fakeToken = "test_token";

    const result = await loginWithGoogle(fakeToken);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
      setLoading(false);
    }
  };

  if (authLoading) return null;

  return (
    <div className="min-h-screen bg-[#071320] flex items-center justify-center p-4 relative overflow-hidden font-sans z-[1]">

      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#00c3ff]/10 rounded-full blur-[150px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#00c3ff]/5 rounded-full blur-[150px] pointer-events-none z-0"></div>

      {/* Contenedor Glassmorphism */}
      <div className="w-full max-w-md bg-[#0e0c1d]/80 backdrop-blur-[15px] p-8 md:p-10 rounded-[25px] border border-[#00c3ff]/30 shadow-[0_10px_40px_rgba(0,0,0,0.8)] relative z-10 transition-all duration-500">

        <div className="text-center mb-8">
          <h1 className="text-[2.5rem] font-extrabold text-white drop-shadow-[0_0_10px_rgba(0,195,255,0.5)] tracking-wide">
            My<span className='text-[#00c3ff]'>Lex</span>
          </h1>
          <p className="text-[#a0a0a0] mt-2 text-sm uppercase tracking-widest font-bold">
            {isRegistering ? "Create your account" : "Sign in to your account"}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-[15px] mb-6 text-sm text-center shadow-[inset_0_0_10px_rgba(239,68,68,0.1)] font-medium">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="bg-[#00c3ff]/10 border border-[#00c3ff]/30 text-[#00c3ff] px-4 py-3 rounded-[15px] mb-6 text-sm text-center shadow-[inset_0_0_10px_rgba(0,195,255,0.1)] font-medium drop-shadow-[0_0_5px_rgba(0,195,255,0.5)]">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleEmailSubmit} className="flex flex-col gap-5 mb-6">
          {isRegistering && (
            <div>
              <label className="block text-[11px] font-bold text-[#00c3ff]/80 uppercase tracking-widest mb-2">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-[#071320] border border-[#00c3ff]/30 rounded-[15px] px-4 py-3.5 text-white placeholder-[#a0a0a0]/40 focus:outline-none focus:border-[#00c3ff] focus:ring-1 focus:ring-[#00c3ff] shadow-[inset_0_2px_5px_rgba(0,0,0,0.5)] transition-all duration-300"
                placeholder="John Doe"
              />
            </div>
          )}
          <div>
            <label className="block text-[11px] font-bold text-[#00c3ff]/80 uppercase tracking-widest mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-[#071320] border border-[#00c3ff]/30 rounded-[15px] px-4 py-3.5 text-white placeholder-[#a0a0a0]/40 focus:outline-none focus:border-[#00c3ff] focus:ring-1 focus:ring-[#00c3ff] shadow-[inset_0_2px_5px_rgba(0,0,0,0.5)] transition-all duration-300"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-[11px] font-bold text-[#00c3ff]/80 uppercase tracking-widest">Password</label>
              {!isRegistering && (
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="text-[10px] text-[#00c3ff] hover:text-white font-bold tracking-wider transition-colors"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full bg-[#071320] border border-[#00c3ff]/30 rounded-[15px] px-4 py-3.5 text-white placeholder-[#a0a0a0]/40 focus:outline-none focus:border-[#00c3ff] focus:ring-1 focus:ring-[#00c3ff] shadow-[inset_0_2px_5px_rgba(0,0,0,0.5)] transition-all duration-300"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-[#00c3ff]/10 border border-[#00c3ff]/50 hover:bg-[#00c3ff]/20 text-[#00c3ff] py-3.5 rounded-full font-bold tracking-widest uppercase text-sm transition-all duration-300 hover:shadow-[0_0_15px_rgba(0,195,255,0.4)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#00c3ff] border-t-transparent shadow-[0_0_5px_rgba(0,195,255,0.5)]"></div>
            ) : (
              isRegistering ? "Register" : "Sign In"
            )}
          </button>
        </form>

        <div className="relative flex items-center py-2 mb-6">
          <div className="flex-grow border-t border-[#00c3ff]/20"></div>
          <span className="flex-shrink-0 mx-4 text-[#a0a0a0] text-[10px] uppercase tracking-widest font-bold">Or continue with</span>
          <div className="flex-grow border-t border-[#00c3ff]/20"></div>
        </div>

        <button
          type="button"
          onClick={handleFakeGoogleLogin}
          disabled={loading}
          className="w-full bg-white text-[#071320] py-3.5 rounded-full font-extrabold flex items-center justify-center gap-3 hover:bg-gray-200 transition-colors duration-300 disabled:opacity-50 shadow-[0_5px_15px_rgba(255,255,255,0.1)] hover:shadow-[0_5px_20px_rgba(255,255,255,0.2)]"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Google
        </button>

        <p className="text-center text-[#a0a0a0] text-sm mt-8">
          {isRegistering ? "Already have an account?" : "Don't have an account?"}
          <button
            type="button"
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError('');
              setSuccessMsg('');
            }}
            className="ml-2 text-[#00c3ff] hover:text-white font-bold transition-colors duration-300 underline underline-offset-4"
          >
            {isRegistering ? "Sign In" : "Register"}
          </button>
        </p>
      </div>
    </div>
  );
}