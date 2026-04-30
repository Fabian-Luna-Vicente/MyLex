import { useAuth } from '../hooks/useAuth';
import { useVocabulary } from '../hooks/useVocabulary';
import { useEffect } from 'react';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { words, fetchWords, loading } = useVocabulary();

  useEffect(() => {
    fetchWords();
  }, [fetchWords]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-8">
      <header className="flex justify-between items-center mb-8 border-b border-slate-700 pb-4">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
          MyLex
        </h1>
        <div className="flex items-center gap-4">
          <span className="text-slate-400">Hello, {user?.username}</span>
          <button 
            onClick={logout}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-medium transition-colors border border-slate-700"
          >
            Sign Out
          </button>
        </div>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl transition-transform hover:-translate-y-1">
          <h2 className="text-xl font-semibold mb-2">My Vocabulary</h2>
          <p className="text-4xl font-bold text-blue-400">
            {loading ? '...' : words.length} <span className="text-lg text-slate-400 font-normal">saved</span>
          </p>
        </div>
      </main>
    </div>
  );
}
