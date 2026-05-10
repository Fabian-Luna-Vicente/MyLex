import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaUserCircle, FaGlobeAmericas, FaBookOpen, FaUsers,
  FaLayerGroup, FaTrophy, FaFlag, FaUserPlus, FaUserCheck,
  FaClock, FaUserMinus, FaArrowLeft
} from 'react-icons/fa';
import { profileService } from '../services/profileService';

export default function UserProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const data = await profileService.getUserProfile(userId);
      setProfile(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async () => {
    setActionLoading(true);
    try {
      await profileService.sendFriendRequest(userId);
      setProfile(prev => ({ ...prev, request_status: 'pending' }));
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveFriend = async () => {
    setActionLoading(true);
    try {
      await profileService.removeFriend(userId);
      setProfile(prev => ({ ...prev, is_friend: false, request_status: null, friend_count: prev.friend_count - 1 }));
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const renderFriendButton = () => {
    if (profile?.is_friend) {
      return (
        <button
          onClick={handleRemoveFriend}
          disabled={actionLoading}
          className="px-5 py-2.5 rounded-xl font-bold text-sm bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all flex items-center gap-2"
        >
          <FaUserMinus /> Remove Friend
        </button>
      );
    }
    if (profile?.request_status === 'pending') {
      return (
        <span className="px-5 py-2.5 rounded-xl font-bold text-sm bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 flex items-center gap-2">
          <FaClock /> Request Pending
        </span>
      );
    }
    return (
      <button
        onClick={handleSendRequest}
        disabled={actionLoading}
        className="px-5 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-[#00c3ff] to-[#0080ff] text-black hover:shadow-[0_0_20px_rgba(0,195,255,0.4)] transition-all flex items-center gap-2 disabled:opacity-50"
      >
        <FaUserPlus /> Add Friend
      </button>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-3 border-[#00c3ff]/20 border-t-[#00c3ff] rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 text-center py-20">
        <p className="text-[#a0a0a0] text-lg">User not found</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-[#00c3ff] font-bold">Go Back</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 pb-32">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[#a0a0a0] hover:text-white font-bold text-sm mb-6 transition-colors"
        >
          <FaArrowLeft /> Back
        </button>

        {/* Header Card */}
        <div className="bg-[#0e0c1d] border border-white/5 rounded-3xl p-8 mb-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-[#00c3ff]/30 to-[#0080ff]/30 border-2 border-[#00c3ff]/30 flex items-center justify-center overflow-hidden flex-shrink-0">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} className="w-full h-full object-cover" alt="avatar" />
              ) : (
                <FaUserCircle size={60} className="text-[#00c3ff]/50" />
              )}
            </div>

            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-3xl font-black text-white tracking-tight">{profile.username}</h1>
              <p className="text-[#a0a0a0] text-sm mt-1">{profile.bio || 'No bio'}</p>

              <div className="flex flex-wrap gap-3 mt-4 justify-center sm:justify-start">
                {profile.country && (
                  <span className="flex items-center gap-1.5 text-xs font-bold text-[#a0a0a0] bg-white/5 px-3 py-1.5 rounded-lg">
                    <FaFlag className="text-[#00c3ff]" /> {profile.country}
                  </span>
                )}
                <span className="flex items-center gap-1.5 text-xs font-bold text-[#00c3ff] bg-[#00c3ff]/10 px-3 py-1.5 rounded-lg border border-[#00c3ff]/20">
                  <FaTrophy /> {profile.level}
                </span>
              </div>
            </div>

            {renderFriendButton()}
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Words', value: profile.total_words, icon: <FaBookOpen /> },
            { label: 'Lists', value: profile.total_lists, icon: <FaLayerGroup /> },
            { label: 'Friends', value: profile.friend_count, icon: <FaUsers /> },
          ].map((stat) => (
            <div key={stat.label} className="bg-[#0e0c1d] border border-white/5 rounded-2xl p-5 text-center">
              <div className="text-[#00c3ff] text-xl mb-2 flex justify-center">{stat.icon}</div>
              <p className="text-3xl font-black text-white">{stat.value}</p>
              <p className="text-[10px] font-bold text-[#a0a0a0] uppercase tracking-widest mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Languages */}
        {(profile.learning_languages?.length > 0 || profile.native_language) && (
          <div className="bg-[#0e0c1d] border border-white/5 rounded-3xl p-8">
            <h2 className="text-[10px] font-bold text-[#a0a0a0] uppercase tracking-widest mb-4">
              <FaGlobeAmericas className="inline mr-1.5 text-[#00c3ff]" /> Languages
            </h2>

            {profile.native_language && (
              <div className="mb-4">
                <span className="text-[10px] font-bold text-[#a0a0a0] uppercase tracking-widest">Native:</span>
                <span className="ml-2 px-3 py-1 rounded-lg text-sm font-bold bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/20">
                  {profile.native_language}
                </span>
              </div>
            )}

            {profile.learning_languages?.length > 0 && (
              <div>
                <span className="text-[10px] font-bold text-[#a0a0a0] uppercase tracking-widest block mb-2">Learning:</span>
                <div className="flex flex-wrap gap-2">
                  {profile.learning_languages.map(lang => (
                    <span key={lang} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#00c3ff]/10 text-[#00c3ff] border border-[#00c3ff]/20">
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Member Since */}
        <div className="mt-6 text-center text-[#a0a0a0] text-xs">
          Member since {profile.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : 'Unknown'}
        </div>

      </motion.div>
    </div>
  );
}
