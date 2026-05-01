import { useState } from 'react';
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
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md bg-slate-800/80 backdrop-blur-xl p-8 rounded-3xl border border-slate-700/50 shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
            MyLex
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            {isRegistering ? "Create your account" : "Sign in to your account"}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-6 text-sm text-center">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="bg-green-500/10 border border-green-500/50 text-green-400 p-3 rounded-lg mb-6 text-sm text-center">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleEmailSubmit} className="flex flex-col gap-4 mb-6">
          {isRegistering && (
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="John Doe"
              />
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-3 rounded-xl font-semibold transition-all disabled:opacity-50"
          >
            {loading ? "Processing..." : (isRegistering ? "Register" : "Sign In")}
          </button>
        </form>

        <div className="relative flex items-center py-2 mb-6">
          <div className="flex-grow border-t border-slate-700"></div>
          <span className="flex-shrink-0 mx-4 text-slate-500 text-xs">Or continue with</span>
          <div className="flex-grow border-t border-slate-700"></div>
        </div>

        <button
          type="button"
          onClick={handleFakeGoogleLogin}
          disabled={loading}
          className="w-full bg-white text-slate-900 py-3 rounded-xl font-semibold flex items-center justify-center gap-3 hover:bg-slate-100 transition-colors disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Google
        </button>

        <p className="text-center text-slate-400 text-sm mt-6">
          {isRegistering ? "Already have an account?" : "Don't have an account?"}
          <button
            type="button"
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError('');
              setSuccessMsg('');
            }}
            className="ml-2 text-blue-400 hover:text-blue-300 font-medium transition-colors"
          >
            {isRegistering ? "Sign In" : "Register"}
          </button>
        </p>
      </div>
    </div>
  );
}
