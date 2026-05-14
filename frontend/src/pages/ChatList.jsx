import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaRobot, FaUserCircle, FaPlus, FaComments, FaArrowRight, FaTimes, FaUsersCog } from 'react-icons/fa';
import { chatService } from '../services/chatService';
import CreateChatModal from '../components/chat/CreateChatModal';
import AIPersonasModal from '../components/chat/AIPersonasModal';

export default function ChatList() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAIPersonasModal, setShowAIPersonasModal] = useState(false);

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    try {
      const data = await chatService.getRooms();
      setRooms(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleChatCreated = (room) => {
    setShowCreateModal(false);
    navigate(`/chat/${room.id}`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 pb-32">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Messages</h1>
            <p className="text-[#a0a0a0] text-sm mt-1">Practice and connect</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setShowAIPersonasModal(true)}
              className="px-4 py-2.5 rounded-xl text-sm font-bold bg-[#00c3ff]/10 text-[#00c3ff] border border-[#00c3ff]/20 hover:bg-[#00c3ff]/20 transition-all flex items-center gap-2"
            >
              <FaUsersCog /> AI Menu
            </button>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-2.5 rounded-xl text-sm font-black bg-[#00c3ff] text-black hover:shadow-[0_0_20px_rgba(0,195,255,0.4)] transition-all flex items-center gap-2"
            >
              <FaPlus /> Custom Chat
            </button>
          </div>
        </header>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-3 border-[#00c3ff]/20 border-t-[#00c3ff] rounded-full animate-spin" />
          </div>
        ) : rooms.length === 0 ? (
          <div className="text-center py-20 bg-[#0e0c1d] border border-white/5 rounded-3xl">
            <FaComments className="mx-auto text-5xl text-[#a0a0a0]/30 mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">No conversations yet</h2>
            <p className="text-[#a0a0a0] text-sm mb-6 max-w-md mx-auto">Start a chat with the AI Tutor to practice, or find friends to learn together.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {rooms.map(room => (
              <motion.div 
                key={room.id}
                whileHover={{ scale: 1.01 }}
                onClick={() => navigate(`/chat/${room.id}`)}
                className="bg-[#0e0c1d] border border-white/5 rounded-2xl p-4 flex items-center gap-4 cursor-pointer hover:border-[#00c3ff]/30 transition-all group"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#00c3ff]/20 to-[#0080ff]/20 border border-[#00c3ff]/30 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {room.is_ai_chat ? (
                    <FaRobot size={24} className="text-[#00c3ff]" />
                  ) : room.partner_avatar ? (
                    <img src={room.partner_avatar} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <FaUserCircle size={28} className="text-[#00c3ff]/50" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-black text-white group-hover:text-[#00c3ff] transition-colors truncate">
                    {room.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded bg-white/5 text-[#a0a0a0]`}>
                      {room.participants?.length || 0} PARTICIPANTS
                    </span>
                    {room.participants?.some(p => p.is_ai) && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#ff00ff]/10 text-[#ff00ff] border border-[#ff00ff]/20">
                        AI INSIDE
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-[#a0a0a0] group-hover:text-[#00c3ff] transition-colors pr-2">
                  <FaArrowRight />
                </div>
              </motion.div>
            ))}
          </div>
        )}

      </motion.div>

      {showCreateModal && (
        <CreateChatModal 
          onClose={() => setShowCreateModal(false)} 
          onSuccess={handleChatCreated} 
        />
      )}

      {showAIPersonasModal && (
        <AIPersonasModal onClose={() => setShowAIPersonasModal(false)} />
      )}
    </div>
  );
}
