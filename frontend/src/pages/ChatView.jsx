import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { chatService } from '../services/chatService';
import { useVocabulary } from '../hooks/useVocabulary';
import {
  FaPaperPlane, FaMicrophone, FaVolumeUp, FaArrowLeft,
  FaBookOpen, FaTimes, FaRobot, FaUserCircle, FaPlus
} from 'react-icons/fa';

export default function ChatView() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { lists, fetchLists } = useVocabulary();

  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [vocabData, setVocabData] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
  const [showVocabPanel, setShowVocabPanel] = useState(false);
  const [showListSelector, setShowListSelector] = useState(false);
  
  const messagesEndRef = useRef(null);
  const wsRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    fetchLists();
    loadRoomData();
    
    // Cleanup WebSocket on unmount
    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, [roomId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadRoomData = async () => {
    setLoading(true);
    try {
      // Find room details from the list (API currently doesn't have get_room by id, so we fetch all and find)
      const allRooms = await chatService.getRooms();
      const currentRoom = allRooms.find(r => r.id === parseInt(roomId));
      setRoom(currentRoom);

      const msgs = await chatService.getMessages(roomId);
      setMessages(msgs.reverse());

      await loadVocabulary();

      if (currentRoom && !currentRoom.is_ai_chat) {
        setupWebSocket(currentRoom.id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadVocabulary = async () => {
    try {
      const vData = await chatService.getRoomVocabulary(roomId);
      setVocabData(vData);
    } catch (e) {
      console.error("Failed to load vocabulary", e);
    }
  };

  const setupWebSocket = (id) => {
    // We assume cookie auth, but websocket sometimes needs a token query param or similar.
    // For simplicity, we just use the API URL and hope cookies are sent, or pass a dummy token if required by the backend.
    const token = document.cookie.split('; ').find(row => row.startsWith('access_token='))?.split('=')[1] || '';
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    // Use the Vite proxy host if in dev, else the actual host
    const wsHost = window.location.hostname === 'localhost' ? 'localhost:8000' : window.location.host;
    const wsUrl = `${wsProtocol}//${wsHost}/api/chat/ws/${id}?token=${token}`;
    
    wsRef.current = new WebSocket(wsUrl);
    
    wsRef.current.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      setMessages(prev => [...prev, msg]);
      // If it's not my message, check if it updates vocab
      if (msg.sender_id !== user.id) {
        loadVocabulary();
      }
    };
    
    wsRef.current.onclose = () => console.log("WS Closed");
  };

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    const text = input;
    setInput('');
    setSending(true);

    try {
      if (room.is_ai_chat) {
        // Optimistic UI for AI chat
        const tempMsg = {
          id: Date.now(),
          room_id: room.id,
          sender_id: user.id,
          content: text,
          created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, tempMsg]);
        
        // Find unused context words to pass to AI
        let contextWords = [];
        vocabData.forEach(list => {
          list.words.forEach(w => {
            if (w.usage_count === 0 && contextWords.length < 3) {
              contextWords.push(w.name);
            }
          });
        });

        const res = await chatService.sendAIMessage(room.id, text, contextWords);
        // Remove temp and add real messages
        setMessages(prev => prev.filter(m => m.id !== tempMsg.id));
        setMessages(prev => [...prev, res.user_message, res.ai_message]);
        
        // Speak AI response if needed
        speak(res.ai_message.content);
        
      } else {
        // Human chat uses WebSocket
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ content: text, message_type: 'text' }));
        }
      }
      // Reload vocab to update strikethroughs
      await loadVocabulary();
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  };

  // --- Voice Features ---

  const initSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support Speech Recognition.");
      return null;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        setInput(prev => prev + (prev ? ' ' : '') + finalTranscript);
      }
    };

    recognition.onend = () => setIsRecording(false);
    recognition.onerror = (e) => {
      console.error(e);
      setIsRecording(false);
    };
    
    return recognition;
  };

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      if (!recognitionRef.current) {
        recognitionRef.current = initSpeechRecognition();
      }
      if (recognitionRef.current) {
        recognitionRef.current.start();
        setIsRecording(true);
      }
    }
  };

  const speak = (text) => {
    if (!window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  // --- Vocabulary Linking ---

  const handleLinkList = async (listId) => {
    try {
      await chatService.linkListToRoom(room.id, listId);
      await loadVocabulary();
      setShowListSelector(false);
      setShowVocabPanel(true);
    } catch (e) {
      console.error(e);
    }
  };

  if (loading || !room) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-3 border-[#00c3ff]/20 border-t-[#00c3ff] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 pb-10 pt-4 h-[calc(100vh-80px)] flex flex-col md:flex-row gap-6">
      
      {/* --- CHAT AREA --- */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} 
        className={`flex-1 flex flex-col bg-[#0e0c1d] border border-white/5 rounded-3xl overflow-hidden ${showVocabPanel ? 'hidden md:flex' : 'flex'}`}
      >
        {/* Chat Header */}
        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-black/20">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/chat')} className="text-[#a0a0a0] hover:text-white transition-colors">
              <FaArrowLeft />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00c3ff]/20 to-[#0080ff]/20 border border-[#00c3ff]/30 flex items-center justify-center overflow-hidden">
                {room.is_ai_chat ? <FaRobot className="text-[#00c3ff]" /> : 
                 room.partner_avatar ? <img src={room.partner_avatar} className="w-full h-full object-cover"/> : 
                 <FaUserCircle size={20} className="text-[#00c3ff]/50" />}
              </div>
              <div>
                <h2 className="text-white font-black">{room.partner_name}</h2>
                <p className="text-[#00ff88] text-[10px] font-bold uppercase tracking-widest">
                  {room.is_ai_chat ? 'Always Online' : 'Active Room'}
                </p>
              </div>
            </div>
          </div>
          <button 
            onClick={() => setShowVocabPanel(!showVocabPanel)}
            className={`p-2.5 rounded-xl transition-all ${showVocabPanel ? 'bg-[#00c3ff] text-black' : 'bg-white/5 text-[#a0a0a0] hover:bg-white/10 hover:text-white'}`}
          >
            <FaBookOpen />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-4">
              <div className="w-16 h-16 rounded-full bg-[#00c3ff]/10 flex items-center justify-center mb-4">
                <FaPaperPlane className="text-[#00c3ff] text-2xl ml-1" />
              </div>
              <p className="text-white font-bold text-lg mb-1">Start the conversation</p>
              <p className="text-[#a0a0a0] text-sm max-w-xs">Link a vocabulary list to practice specific words while chatting.</p>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isMine = msg.sender_id === user.id;
              return (
                <div key={idx} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] rounded-2xl p-4 ${
                    isMine 
                      ? 'bg-gradient-to-br from-[#00c3ff] to-[#0080ff] text-black rounded-tr-sm shadow-[0_5px_15px_rgba(0,195,255,0.2)]' 
                      : 'bg-[#1a182c] border border-white/5 text-white rounded-tl-sm'
                  }`}>
                    <p className={`text-sm ${isMine ? 'font-medium' : ''}`}>{msg.content}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-[9px] font-bold uppercase ${isMine ? 'text-black/50' : 'text-[#a0a0a0]'}`}>
                        {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                      {!isMine && room.is_ai_chat && (
                        <button onClick={() => speak(msg.content)} className="text-[#a0a0a0] hover:text-[#00c3ff] transition-colors">
                          <FaVolumeUp size={10} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          {sending && (
            <div className="flex justify-end">
              <div className="bg-gradient-to-br from-[#00c3ff]/50 to-[#0080ff]/50 text-black rounded-2xl p-4 rounded-tr-sm opacity-50">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-black rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-black rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-1.5 h-1.5 bg-black rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-black/20 border-t border-white/5">
          <div className="flex gap-2">
            <button 
              onClick={toggleRecording}
              className={`p-3.5 rounded-xl border flex items-center justify-center transition-all ${
                isRecording 
                  ? 'bg-red-500/20 border-red-500/50 text-red-500 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.3)]' 
                  : 'bg-[#0e0c1d] border-white/10 text-[#a0a0a0] hover:border-[#00c3ff]/50 hover:text-[#00c3ff]'
              }`}
            >
              <FaMicrophone />
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type a message..."
              className="flex-1 bg-[#0e0c1d] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-[#00c3ff]/50 focus:outline-none transition-all"
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim() || sending}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#00c3ff] to-[#0080ff] text-black font-black hover:shadow-[0_0_20px_rgba(0,195,255,0.4)] transition-all disabled:opacity-50"
            >
              <FaPaperPlane />
            </button>
          </div>
        </div>
      </motion.div>

      {/* --- VOCABULARY PANEL --- */}
      <AnimatePresence>
        {showVocabPanel && (
          <motion.div 
            initial={{ opacity: 0, x: 20, width: 0 }}
            animate={{ opacity: 1, x: 0, width: '320px' }}
            exit={{ opacity: 0, x: 20, width: 0 }}
            className={`flex-none bg-[#0e0c1d] border border-white/5 rounded-3xl overflow-hidden flex flex-col ${!showVocabPanel ? 'hidden' : 'flex md:flex'}`}
          >
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-black/20">
              <h3 className="font-black text-white flex items-center gap-2">
                <FaBookOpen className="text-[#00c3ff]" /> Word Target
              </h3>
              <button onClick={() => setShowVocabPanel(false)} className="md:hidden text-[#a0a0a0] hover:text-white">
                <FaTimes />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {vocabData.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-[#a0a0a0] text-sm mb-4">No vocabulary lists linked to this chat.</p>
                  <button 
                    onClick={() => setShowListSelector(true)}
                    className="px-4 py-2 w-full rounded-xl bg-[#00c3ff]/10 border border-[#00c3ff]/20 text-[#00c3ff] font-bold text-sm hover:bg-[#00c3ff]/20 transition-all"
                  >
                    Link a List
                  </button>
                </div>
              ) : (
                <>
                  <button 
                    onClick={() => setShowListSelector(true)}
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-dashed border-white/20 text-[#a0a0a0] hover:border-[#00c3ff]/50 hover:text-[#00c3ff] transition-all text-sm font-bold"
                  >
                    <FaPlus size={10} /> Add Another List
                  </button>

                  {vocabData.map(list => (
                    <div key={list.list_id}>
                      <h4 className="text-[10px] font-bold text-[#00c3ff] uppercase tracking-widest mb-3 border-b border-white/5 pb-1">
                        {list.list_name}
                      </h4>
                      <div className="space-y-2">
                        {list.words.map(w => {
                          const used = w.usage_count > 0;
                          return (
                            <div key={w.id} className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                              used ? 'bg-[#00ff88]/5 border-[#00ff88]/20' : 'bg-white/5 border-transparent'
                            }`}>
                              <div>
                                <p className={`font-bold text-sm ${used ? 'text-[#00ff88] line-through opacity-70' : 'text-white'}`}>
                                  {w.name}
                                </p>
                                <p className="text-[10px] text-[#a0a0a0] truncate max-w-[150px]">{w.meaning}</p>
                              </div>
                              {used && (
                                <div className="text-[10px] font-bold text-black bg-[#00ff88] px-2 py-0.5 rounded-full">
                                  {w.usage_count}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- LIST SELECTOR MODAL --- */}
      {showListSelector && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0e0c1d] border border-white/10 rounded-3xl p-6 w-full max-w-md shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-white">Select a List to Practice</h2>
              <button onClick={() => setShowListSelector(false)} className="text-[#a0a0a0] hover:text-white"><FaTimes /></button>
            </div>
            
            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
              {lists.map(list => {
                const isLinked = vocabData.some(v => v.list_id === list.id);
                return (
                  <button
                    key={list.id}
                    onClick={() => !isLinked && handleLinkList(list.id)}
                    disabled={isLinked}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      isLinked 
                        ? 'bg-white/5 border-white/5 opacity-50 cursor-not-allowed' 
                        : 'bg-white/5 border-transparent hover:bg-[#00c3ff]/10 hover:border-[#00c3ff]/30 hover:shadow-[0_0_15px_rgba(0,195,255,0.1)]'
                    }`}
                  >
                    <h3 className="font-bold text-white mb-1">{list.name}</h3>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[#a0a0a0]">{list.description}</span>
                      {isLinked && <span className="text-[#00c3ff] font-bold text-[10px] uppercase">Linked</span>}
                    </div>
                  </button>
                )
              })}
              {lists.length === 0 && (
                <p className="text-center text-[#a0a0a0] py-4">You don't have any vocabulary lists yet.</p>
              )}
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}
