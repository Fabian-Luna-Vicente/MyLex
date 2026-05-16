import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaUserCircle, FaEdit, FaSave, FaTimes, FaGlobeAmericas,
  FaBookOpen, FaUsers, FaLayerGroup, FaTrophy, FaFlag
} from 'react-icons/fa';
import { profileService } from '../services/profileService';

const LANGUAGES = [
  'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese',
  'Japanese', 'Korean', 'Chinese', 'Arabic', 'Russian', 'Hindi',
  'Dutch', 'Swedish', 'Turkish', 'Polish', 'Vietnamese', 'Thai'
];

const LEVELS = ['Beginner', 'Elementary', 'Intermediate', 'Upper Intermediate', 'Advanced', 'Native'];

export default function MyProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await profileService.getMyProfile();
      setProfile(data);
      setForm({
        bio: data.bio || '',
        country: data.country || '',
        native_language: data.native_language || '',
        learning_languages: data.learning_languages || [],
        level: data.level || 'Beginner',
        avatar_url: data.avatar_url || ''
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await profileService.updateProfile(form);
      setProfile(updated);
      setEditing(false);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const toggleLanguage = (lang) => {
    setForm(prev => {
      const langs = prev.learning_languages || [];
      if (langs.includes(lang)) {
        return { ...prev, learning_languages: langs.filter(l => l !== lang) };
      }
      return { ...prev, learning_languages: [...langs, lang] };
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-3 border-[#00c3ff]/20 border-t-[#00c3ff] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 pb-32">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

        {/* Header Card */}
        <div className="bg-[#0e0c1d] border border-white/5 rounded-3xl p-8 mb-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Avatar */}
            <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-[#00c3ff]/30 to-[#0080ff]/30 border-2 border-[#00c3ff]/30 flex items-center justify-center overflow-hidden flex-shrink-0">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} className="w-full h-full object-cover" alt="avatar" />
              ) : (
                <FaUserCircle size={60} className="text-[#00c3ff]/50" />
              )}
            </div>

            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-3xl font-black text-white tracking-tight">{profile?.username}</h1>
              <p className="text-[#a0a0a0] text-sm mt-1">{profile?.bio || 'No bio yet'}</p>

              <div className="flex flex-wrap gap-3 mt-4 justify-center sm:justify-start">
                {profile?.country && (
                  <span className="flex items-center gap-1.5 text-xs font-bold text-[#a0a0a0] bg-white/5 px-3 py-1.5 rounded-lg">
                    <FaFlag className="text-[#00c3ff]" /> {profile.country}
                  </span>
                )}
                <span className="flex items-center gap-1.5 text-xs font-bold text-[#00c3ff] bg-[#00c3ff]/10 px-3 py-1.5 rounded-lg border border-[#00c3ff]/20">
                  <FaTrophy /> {profile?.level}
                </span>
              </div>
            </div>

            <button
              onClick={() => setEditing(!editing)}
              className="px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 bg-white/5 border border-white/10 text-white hover:border-[#00c3ff]/50 hover:text-[#00c3ff]"
            >
              {editing ? <><FaTimes /> Cancel</> : <><FaEdit /> Edit Profile</>}
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Words', value: profile?.total_words || 0, icon: <FaBookOpen /> },
            { label: 'Lists', value: profile?.total_lists || 0, icon: <FaLayerGroup /> },
            { label: 'Friends', value: profile?.friend_count || 0, icon: <FaUsers />, onClick: () => navigate('/friends') },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              whileHover={{ scale: 1.03 }}
              onClick={stat.onClick}
              className={`bg-[#0e0c1d] border border-white/5 rounded-2xl p-5 text-center ${stat.onClick ? 'cursor-pointer hover:border-[#00c3ff]/30' : ''}`}
            >
              <div className="text-[#00c3ff] text-xl mb-2 flex justify-center">{stat.icon}</div>
              <p className="text-3xl font-black text-white">{stat.value}</p>
              <p className="text-[10px] font-bold text-[#a0a0a0] uppercase tracking-widest mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Edit Form */}
        {editing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-[#0e0c1d] border border-white/5 rounded-3xl p-8 mb-6"
          >
            <h2 className="text-lg font-black text-white mb-6">Edit Profile</h2>

            <div className="space-y-5">
              {/* Bio */}
              <div>
                <label className="text-[10px] font-bold text-[#a0a0a0] uppercase tracking-widest block mb-2">Bio</label>
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  maxLength={200}
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-[#00c3ff]/50 focus:outline-none resize-none"
                  placeholder="Tell others about yourself..."
                />
              </div>

              {/* Avatar URL */}
              <div>
                <label className="text-[10px] font-bold text-[#a0a0a0] uppercase tracking-widest block mb-2">Avatar URL</label>
                <input
                  type="text"
                  value={form.avatar_url}
                  onChange={(e) => setForm({ ...form, avatar_url: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-[#00c3ff]/50 focus:outline-none"
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>

              {/* Country */}
              <div>
                <label className="text-[10px] font-bold text-[#a0a0a0] uppercase tracking-widest block mb-2">Country</label>
                <input
                  type="text"
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-[#00c3ff]/50 focus:outline-none"
                  placeholder="Spain, USA, Japan..."
                />
              </div>

              {/* Native Language */}
              <div className="mt-4 mb-6">
                <label className="text-[10px] font-bold text-[#a0a0a0] uppercase tracking-widest block ">
                  Native Language
                </label>
                <div className="relative">
                  <div className="relative">
                    <select
                      name="native_language"
                      value={form.native_language || ''}
                      onChange={(e) => setForm({ ...form, native_language: e.target.value })}
                      className="w-full bg-[#0e0c1d] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-[#00c3ff]/50 focus:shadow-[0_0_15px_rgba(0,195,255,0.2)] focus:outline-none transition-all appearance-none cursor-pointer"
                    >
                      <option value="" className="bg-[#1a182c] text-[#a0a0a0]">Select native language...</option>
                      <option value="English" className="bg-[#1a182c] text-white">English</option>
                      <option value="Spanish" className="bg-[#1a182c] text-white">Spanish</option>
                      <option value="French" className="bg-[#1a182c] text-white">French</option>
                      <option value="German" className="bg-[#1a182c] text-white">German</option>
                    </select>

                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-[#a0a0a0]">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Level */}
                <div className="mt-4 mb-6">
                  <label className="text-[10px] font-bold text-[#a0a0a0] uppercase tracking-widest block mb-2">Level</label>
                  <select
                    value={form.level}
                    onChange={(e) => setForm({ ...form, level: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-[#00c3ff]/50 focus:outline-none"
                  >
                    {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>

                {/* Learning Languages */}
                <div className="mt-4 mb-6">
                  <label className="text-[10px] font-bold text-[#a0a0a0] uppercase tracking-widest block mb-2">
                    <FaGlobeAmericas className="inline mr-1" /> Learning Languages
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {LANGUAGES.map(lang => (
                      <button
                        key={lang}
                        onClick={() => toggleLanguage(lang)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${(form.learning_languages || []).includes(lang)
                          ? 'bg-[#00c3ff]/20 text-[#00c3ff] border border-[#00c3ff]/40'
                          : 'bg-white/5 text-[#a0a0a0] border border-white/10 hover:border-white/20'
                          }`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full py-3.5 rounded-xl font-black text-sm bg-gradient-to-r from-[#00c3ff] to-[#0080ff] text-black hover:shadow-[0_0_30px_rgba(0,195,255,0.4)] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <FaSave /> {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Languages Section */}
        {!editing && (profile?.learning_languages?.length > 0 || profile?.native_language) && (
          <div className="bg-[#0e0c1d] border border-white/5 rounded-3xl p-8">
            <h2 className="text-[10px] font-bold text-[#a0a0a0] uppercase tracking-widest mb-4">
              <FaGlobeAmericas className="inline mr-1.5 text-[#00c3ff]" /> Languages
            </h2>

            {profile?.native_language && (
              <div className="mb-4">
                <span className="text-[10px] font-bold text-[#a0a0a0] uppercase tracking-widest">Native:</span>
                <span className="ml-2 px-3 py-1 rounded-lg text-sm font-bold bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/20">
                  {profile.native_language}
                </span>
              </div>
            )}

            {profile?.learning_languages?.length > 0 && (
              <div>
                <span className="text-[10px] font-bold text-[#a0a0a0] uppercase tracking-widest block mb-2">Learning:</span>
                <div className="flex flex-wrap gap-2">
                  {profile.learning_languages.map(lang => (
                    <span
                      key={lang}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#00c3ff]/10 text-[#00c3ff] border border-[#00c3ff]/20"
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
