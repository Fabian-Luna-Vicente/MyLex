import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaUserCircle, FaSearch, FaUserPlus, FaUserCheck,
  FaClock, FaArrowLeft
} from 'react-icons/fa';
import { profileService } from '../services/profileService';

export default function SearchUsers() {
  const navigate = useNavigate();
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearchLoading(true);
    try {
      const data = await profileService.searchUsers(searchQuery);
      setSearchResults(data);
    } catch (e) {
      console.error(e);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSendRequest = async (userId) => {
    try {
      await profileService.sendFriendRequest(userId);
      setSearchResults(prev => prev.map(u =>
        u.user_id === userId ? { ...u, request_status: 'pending' } : u
      ));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 pb-32">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)} className="text-[#a0a0a0] hover:text-white transition-colors">
            <FaArrowLeft size={18} />
          </button>
          <h1 className="text-2xl font-black text-white tracking-tight">Find Users</h1>
        </div>

        <div>
          <div className="flex gap-3 mb-6">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search by name or email..."
              className="flex-1 bg-[#0e0c1d] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-[#00c3ff]/50 focus:outline-none"
            />
            <button
              onClick={handleSearch}
              disabled={searchLoading}
              className="px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-[#00c3ff] to-[#0080ff] text-black transition-all hover:shadow-[0_0_20px_rgba(0,195,255,0.4)]"
            >
              <FaSearch />
            </button>
          </div>

          <div className="space-y-3">
            {searchLoading ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-2 border-[#00c3ff]/20 border-t-[#00c3ff] rounded-full animate-spin" />
              </div>
            ) : searchResults.length === 0 && searchQuery ? (
              <div className="text-center py-12">
                <p className="text-[#a0a0a0]">No users found</p>
              </div>
            ) : (
              searchResults.map(user => (
                <div
                  key={user.user_id}
                  className="bg-[#0e0c1d] border border-white/5 rounded-2xl p-4 flex items-center gap-4"
                >
                  <div
                    className="w-12 h-12 rounded-xl bg-[#00c3ff]/10 border border-[#00c3ff]/20 flex items-center justify-center overflow-hidden flex-shrink-0 cursor-pointer"
                    onClick={() => navigate(`/user/${user.user_id}`)}
                  >
                    {user.avatar_url ? (
                      <img src={user.avatar_url} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <FaUserCircle size={24} className="text-[#00c3ff]/50" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-white font-black truncate cursor-pointer hover:text-[#00c3ff]"
                      onClick={() => navigate(`/user/${user.user_id}`)}
                    >
                      {user.username}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-bold text-[#00c3ff] bg-[#00c3ff]/10 px-2 py-0.5 rounded">{user.level}</span>
                    </div>
                  </div>

                  {user.is_friend ? (
                    <span className="text-[#00ff88] text-sm font-bold flex items-center gap-1"><FaUserCheck /> Friends</span>
                  ) : user.request_status === 'pending' ? (
                    <span className="text-yellow-400 text-sm font-bold flex items-center gap-1"><FaClock /> Pending</span>
                  ) : (
                    <button
                      onClick={() => handleSendRequest(user.user_id)}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-[#00c3ff]/10 border border-[#00c3ff]/20 text-[#00c3ff] hover:bg-[#00c3ff]/20 transition-all flex items-center gap-1"
                    >
                      <FaUserPlus /> Add
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

      </motion.div>
    </div>
  );
}
