import { useState, useEffect, useRef } from 'react';
import { chatService } from '../services/chatService';
import { profileService } from '../services/profileService';
import { useVocabulary } from './useVocabulary';
import api from '../services/api';

export const useChatView = (roomId, user) => {
  const { lists, fetchLists } = useVocabulary();

  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [vocabData, setVocabData] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [loadingIcebreaker, setLoadingIcebreaker] = useState(false);
  const [checkingGrammar, setCheckingGrammar] = useState(false);
  const [grammarResult, setGrammarResult] = useState(null);

  const [showVocabPanel, setShowVocabPanel] = useState(false);
  const [showListSelector, setShowListSelector] = useState(false);

  const messagesEndRef = useRef(null);
  const wsRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    fetchLists();
    loadRoomData();

    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, [roomId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
    }, 100);
  };

  const loadRoomData = async () => {
    setLoading(true);
    try {
      const allRooms = await chatService.getRooms();
      const currentRoom = allRooms.find(r => r.id === parseInt(roomId));
      setRoom(currentRoom);

      const msgs = await chatService.getMessages(roomId);
      setMessages(msgs.reverse());

      await loadVocabulary();

      setupWebSocket(currentRoom.id);
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
    if (wsRef.current) {
      wsRef.current.close();
    }
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsHost = window.location.hostname === 'localhost' ? 'localhost:8000' : window.location.host;
    const wsUrl = `${wsProtocol}//${wsHost}/api/chat/ws/${id}`;

    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      // Ensure we don't duplicate messages sent via REST
      setMessages(prev => {
        if (prev.find(m => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
      if (msg.participant && msg.participant.user_id !== user.id) {
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
      const hasAI = room.participants && room.participants.some(p => p.is_ai);

      if (hasAI) {
        let contextWords = [];
        vocabData.forEach(list => {
          list.words.forEach(w => {
            if (w.usage_count === 0 && contextWords.length < 3) {
              contextWords.push(w.name);
            }
          });
        });

        const res = await api.post('/api/chat/ai/message', {
          room_id: room.id,
          message: text,
          context_words: contextWords,
          mentioned_ai_participant_ids: []
        });

        const newMessages = res.data; // The endpoint returns a list of messages [user_msg, ai_msg_1, ...]
        
        setMessages(prev => {
          const prevMap = new Map(prev.map(m => [m.id, m]));
          newMessages.forEach(m => prevMap.set(m.id, m));
          return Array.from(prevMap.values()).sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        });

        // Speak the last AI response
        const aiMessages = newMessages.filter(m => m.participant && m.participant.is_ai);
        if (aiMessages.length > 0) {
          speak(aiMessages[aiMessages.length - 1].content);
        }

      } else {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ content: text, message_type: 'text' }));
        }
      }
      await loadVocabulary();
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  };

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

  const handleIcebreaker = async () => {
    setLoadingIcebreaker(true);
    try {
      const vocabWords = [];
      vocabData.forEach(list => {
        list.words.forEach(w => {
          if (w.usage_count === 0 && vocabWords.length < 5) {
            vocabWords.push(w.name);
          }
        });
      });

      const response = await api.post('/api/chat/icebreaker', {
        room_id: room.id,
        language: room.language || "English",
        vocabulary_words: vocabWords
      });

      if (response.data.status) {
        const icebreakerMsg = response.data.message;

        const hasAI = room.participants && room.participants.some(p => p.is_ai);
        if (hasAI) {
          const aiParticipant = room.participants.find(p => p.is_ai);
          const newAiMessage = {
            id: Date.now(),
            room_id: room.id,
            participant_id: aiParticipant.id,
            participant: aiParticipant,
            content: icebreakerMsg,
            created_at: new Date().toISOString()
          };
          setMessages(prev => [...prev, newAiMessage]);
          speak(icebreakerMsg);
        } else {
          setInput(icebreakerMsg);
        }
      }
    } catch (error) {
      console.error("Error al generar el rompehielos:", error);
    } finally {
      setLoadingIcebreaker(false);
    }
  };

  const handleUpdateRoomInfo = async (data) => {
    try {
      const updated = await chatService.updateRoom(room.id, data);
      setRoom(updated);
      return true;
    } catch (e) {
      console.error("Error updating room:", e);
      return false;
    }
  };

  const handleLeaveRoom = async () => {
    try {
      const res = await chatService.leaveRoom(room.id);
      return res.status;
    } catch (e) {
      console.error("Error leaving room:", e);
      return false;
    }
  };

  const handleGrammarCheck = async () => {
    if (!input.trim()) return;

    setCheckingGrammar(true);
    setGrammarResult(null);
    try {
      const res = await api.post('/api/chat/grammar-check', {
        message: input,
        language: room?.language || "English"
      });
      if (res.data.status) {
        setGrammarResult(res.data.data);
        if (res.data.data.has_errors && res.data.data.corrected_text) {
          setInput(res.data.data.corrected_text);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCheckingGrammar(false);
    }
  };

  return {
    room,
    messages,
    vocabData,
    input,
    setInput,
    loading,
    sending,
    isRecording,
    loadingIcebreaker,
    showVocabPanel,
    setShowVocabPanel,
    showListSelector,
    setShowListSelector,
    messagesEndRef,
    handleSend,
    toggleRecording,
    speak,
    handleLinkList,
    handleIcebreaker,
    handleUpdateRoomInfo,
    handleLeaveRoom,
    handleGrammarCheck,
    checkingGrammar,
    grammarResult,
    setGrammarResult,
    lists
  };
};
