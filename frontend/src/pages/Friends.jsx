import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaUserCircle, FaSearch, FaUserPlus, FaUserCheck,
  FaClock, FaCheck, FaTimes, FaUsers, FaInbox, FaArrowLeft
} from 'react-icons/fa';
import { useFriends } from '../hooks/useFriends';

export default function Friends() {
  const navigate = useNavigate();
  const {
    tab,
    setTab,
    friends,
    requests,
    loading,
    handleRespondRequest
  } = useFriends();

  const tabs = [
    { id: 'friends', label: 'Friends', icon: <FaUsers />, count: friends.length },
    { id: 'requests', label: 'Requests', icon: <FaInbox />, count: requests.length },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 pb-32">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)} className="text-[#a0a0a0] hover:text-white transition-colors">
            <FaArrowLeft size={18} />
          </button>
          <h1 className="text-2xl font-black text-white tracking-tight">Friends</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 bg-[#0e0c1d] p-1.5 rounded-2xl border border-white/5">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
                tab === t.id
                  ? 'bg-[#00c3ff]/10 text-[#00c3ff] border border-[#00c3ff]/20'
                  : 'text-[#a0a0a0] hover:text-white'
              }`}
            >
              {t.icon}
              <span className="hidden sm:inline">{t.label}</span>
              {t.count > 0 && (
                <span className="bg-[#00c3ff] text-black text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Friends Tab */}
        {tab === 'friends' && (
          <div className="space-y-3">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-2 border-[#00c3ff]/20 border-t-[#00c3ff] rounded-full animate-spin" />
              </div>
            ) : friends.length === 0 ? (
              <div className="text-center py-16">
                <FaUsers size={40} className="text-[#a0a0a0]/30 mx-auto mb-4" />
                <p className="text-[#a0a0a0] font-bold">No friends yet</p>
                <p className="text-[#a0a0a0]/60 text-sm mt-1">Search for users to add friends</p>
              </div>
            ) : (
              friends.map(friend => (
                <motion.div
                  key={friend.user_id}
                  whileHover={{ scale: 1.01 }}
                  onClick={() => navigate(`/user/${friend.user_id}`)}
                  className="bg-[#0e0c1d] border border-white/5 rounded-2xl p-4 flex items-center gap-4 cursor-pointer hover:border-[#00c3ff]/20 transition-all"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#00c3ff]/10 border border-[#00c3ff]/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {friend.avatar_url ? (
                      <img src={friend.avatar_url} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <FaUserCircle size={24} className="text-[#00c3ff]/50" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-black truncate">{friend.username}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-bold text-[#00c3ff] bg-[#00c3ff]/10 px-2 py-0.5 rounded">{friend.level}</span>
                      {friend.learning_languages?.slice(0, 2).map(l => (
                        <span key={l} className="text-[10px] font-bold text-[#a0a0a0] bg-white/5 px-2 py-0.5 rounded">{l}</span>
                      ))}
                    </div>
                  </div>
                  <FaUserCheck className="text-[#00c3ff] flex-shrink-0" />
                </motion.div>
              ))
            )}
          </div>
        )}

        {/* Requests Tab */}
        {tab === 'requests' && (
          <div className="space-y-3">
            {requests.length === 0 ? (
              <div className="text-center py-16">
                <FaInbox size={40} className="text-[#a0a0a0]/30 mx-auto mb-4" />
                <p className="text-[#a0a0a0] font-bold">No pending requests</p>
              </div>
            ) : (
              requests.map(req => (
                <div
                  key={req.id}
                  className="bg-[#0e0c1d] border border-white/5 rounded-2xl p-4 flex items-center gap-4"
                >
                  <div
                    className="w-12 h-12 rounded-xl bg-[#00c3ff]/10 border border-[#00c3ff]/20 flex items-center justify-center overflow-hidden flex-shrink-0 cursor-pointer"
                    onClick={() => navigate(`/user/${req.sender_id}`)}
                  >
                    {req.sender_avatar ? (
                      <img src={req.sender_avatar} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <FaUserCircle size={24} className="text-[#00c3ff]/50" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-black truncate cursor-pointer hover:text-[#00c3ff]" onClick={() => navigate(`/user/${req.sender_id}`)}>
                      {req.sender_name}
                    </p>
                    <p className="text-[#a0a0a0] text-xs mt-0.5">Wants to be your friend</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleRespondRequest(req.id, 'accept')}
                      className="w-10 h-10 rounded-xl bg-[#00c3ff]/10 border border-[#00c3ff]/20 text-[#00c3ff] flex items-center justify-center hover:bg-[#00c3ff]/20 transition-all"
                    >
                      <FaCheck />
                    </button>
                    <button
                      onClick={() => handleRespondRequest(req.id, 'reject')}
                      className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-white flex items-center justify-center hover:bg-white/10 transition-all"
                    >
                      <FaTimes />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

      </motion.div>
    </div>
  );
}
