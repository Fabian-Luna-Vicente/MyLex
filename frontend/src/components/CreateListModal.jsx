import { useState } from 'react';
import { FaTimes, FaLayerGroup } from 'react-icons/fa';
import { LANGUAGES } from '../config/constants';

export default function CreateListModal({ isOpen, onClose, onCreate }) {
  const [listName, setListName] = useState('');
  const [privacy, setPrivacy] = useState('public');
  const [language, setLanguage] = useState('English');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!listName.trim()) return;

    setLoading(true);
    try {
      await onCreate({ name: listName, privacy, language });
      setListName('');
      setPrivacy('public');
      setLanguage('English');
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans">
      {/* Overlay: Fondo oscuro con blur */}
      <div
        className="absolute inset-0 bg-[#071320]/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      ></div>

      <div className="relative bg-[#0e0c1d]/80 backdrop-blur-[15px] rounded-[20px] w-full max-w-md p-8 shadow-[0_10px_30px_rgba(0,0,0,0.8)] border border-[#00c3ff]/30 transform transition-all">

        {/* Título */}
        <h2 className="text-[1.8rem] font-bold mb-6 text-white drop-shadow-[0_0_10px_rgba(0,195,255,0.5)]">
          Create New <span className="text-[#00c3ff]">List</span>
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-8">
            <label className="block text-[11px] font-bold text-[#00c3ff]/80 uppercase tracking-widest mb-2">
              List Name
            </label>
            <input
              type="text"
              value={listName}
              onChange={(e) => setListName(e.target.value)}
              className="w-full bg-[#071320] border border-[#00c3ff]/30 rounded-[15px] px-4 py-3 text-white placeholder-[#a0a0a0]/40 focus:outline-none focus:border-[#00c3ff] focus:ring-1 focus:ring-[#00c3ff] shadow-[inset_0_2px_5px_rgba(0,0,0,0.5)] transition-all duration-300"
              placeholder="e.g. Travel Vocabulary, Irregular Verbs..."
              autoFocus
            />
          </div>

          <div className="mb-4">
            <label className="block text-[11px] font-bold text-[#00c3ff]/80 uppercase tracking-widest mb-2">
              Privacy
            </label>
            <select
              value={privacy}
              onChange={(e) => setPrivacy(e.target.value)}
              className="w-full bg-[#071320] border border-[#00c3ff]/30 rounded-[15px] px-4 py-3 text-white focus:outline-none focus:border-[#00c3ff] focus:ring-1 focus:ring-[#00c3ff] transition-all duration-300"
            >
              <option value="public">Public</option>
              <option value="friends">Friends Only</option>
              <option value="private">Private</option>
            </select>
          </div>

          <div className="mb-8">
            <label className="block text-[11px] font-bold text-[#00c3ff]/80 uppercase tracking-widest mb-2">
              Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full bg-[#071320] border border-[#00c3ff]/30 rounded-[15px] px-4 py-3 text-white focus:outline-none focus:border-[#00c3ff] focus:ring-1 focus:ring-[#00c3ff] transition-all duration-300"
            >
              {LANGUAGES.map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>

          {/* Botones */}
          <div className="flex gap-4 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-full font-bold tracking-wide text-[#a0a0a0] hover:text-[#00c3ff] hover:bg-[#00c3ff]/10 transition-colors duration-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !listName.trim()}
              className="px-6 py-2.5 rounded-full font-bold tracking-wide bg-[#0e0c1d]/60 backdrop-blur-sm border border-[#00c3ff]/50 text-[#00c3ff] hover:bg-[#00c3ff]/20 hover:border-[#00c3ff] hover:shadow-[0_0_15px_rgba(0,195,255,0.4)] transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#00c3ff] border-t-transparent shadow-[0_0_5px_rgba(0,195,255,0.5)]"></div>
              ) : null}
              Create List
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}