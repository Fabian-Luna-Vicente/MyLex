import { useState, useEffect, useRef } from 'react';
import { chatService } from '../services/chatService';
import { profileService } from '../services/profileService';
import { useVocabulary } from './useVocabulary';
import api from '../services/api';
import { useFluidMode } from './useFluidMode';

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

  const [interimResult, setInterimResult] = useState('');
  const [speechStatus, setSpeechStatus] = useState('idle');

  const messagesEndRef = useRef(null);
  const wsRef = useRef(null);
  const recognitionRef = useRef(null);
  const startTimeoutRef = useRef(null);

  const [showParticipants, setShowParticipants] = useState(false);
  const [showRoomInfo, setShowRoomInfo] = useState(false);
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [editData, setEditData] = useState({ name: '', description: '', context: '' });
  const [mentionQuery, setMentionQuery] = useState(null);
  const inputRef = useRef(null);
  const scrollContainerRef = useRef(null);

  // Fluid mode hook — room and vocabData may be null initially, used lazily
  const fluidMode = useFluidMode({ room, user, wsRef, vocabData, setMessages });

  // Stable refs so the WS onmessage callback always calls the latest handlers
  const handleFluidSignalRef = useRef(null);
  const handleIncomingAIMessageRef = useRef(null);
  const isFluidModeRef = useRef(false);
  handleFluidSignalRef.current = fluidMode.handleFluidSignal;
  handleIncomingAIMessageRef.current = fluidMode.handleIncomingAIMessage;
  isFluidModeRef.current = fluidMode.isFluidMode;

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

  useEffect(() => {
    if (showRoomInfo) {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
      }
    } else {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
      }, 100);
    }
  }, [showRoomInfo]);

  const startEditing = () => {
    setEditData({ name: room?.name || '', description: room?.description || '', context: room?.context || '' });
    setIsEditingInfo(true);
  };

  const saveEditing = async () => {
    const success = await handleUpdateRoomInfo(editData);
    if (success) setIsEditingInfo(false);
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInput(val);

    const cursor = e.target.selectionStart;
    const textBeforeCursor = val.slice(0, cursor);
    const words = textBeforeCursor.split(/\s+/);
    const lastWord = words[words.length - 1];

    if (lastWord.startsWith('@')) {
      setMentionQuery(lastWord.slice(1).toLowerCase());
    } else {
      setMentionQuery(null);
    }
  };

  const handleMentionSelect = (aiName) => {
    const cursor = inputRef.current.selectionStart;
    const textBeforeCursor = input.slice(0, cursor);
    const textAfterCursor = input.slice(cursor);
    const words = textBeforeCursor.split(/\s+/);
    words.pop();

    const prefix = words.length > 0 ? words.join(' ') + ' ' : '';
    const newText = prefix + `@${aiName} ` + textAfterCursor;

    setInput(newText);
    setMentionQuery(null);
    inputRef.current?.focus();
  };

  const mentionSuggestions = mentionQuery !== null && room?.participants
    ? room.participants.filter(p => p.is_ai && p.ai_name && p.ai_name.toLowerCase().includes(mentionQuery))
    : [];

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
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const wsBaseUrl = apiUrl.replace(/^http/, 'ws');
    const wsUrl = `${wsBaseUrl.replace(/\/$/, '')}/api/chat/ws/${id}`;

    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onmessage = (event) => {
      const msg = JSON.parse(event.data);

      // Fluid Mode signaling — route to fluid handler, don't save as message
      if (msg._fluid_signal) {
        handleFluidSignalRef.current?.(msg);
        return;
      }

      // Regular chat message
      setMessages(prev => {
        if (prev.find(m => m.id === msg.id)) return prev;
        return [...prev, msg];
      });

      // In Fluid Mode: trigger TTS for incoming AI messages from other users
      if (isFluidModeRef.current && msg.participant?.is_ai) {
        handleIncomingAIMessageRef.current?.(msg);
      }

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

        const aiLanguage = localStorage.getItem('ai_language') || 'es';
        const res = await api.post('/api/chat/ai/message', {
          room_id: room.id,
          message: text,
          context_words: contextWords,
          mentioned_ai_participant_ids: [],
          ai_language: aiLanguage
        });

        const newMessages = res.data.messages || res.data; // The endpoint returns a dict with messages
        
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

  const getLanguageCode = (langName) => {
    if (!langName) return 'en-US';
    const map = {
      'english': 'en-US',
      'spanish': 'es-ES',
      'french': 'fr-FR',
      'german': 'de-DE',
      'italian': 'it-IT',
      'portuguese': 'pt-BR',
      'russian': 'ru-RU',
      'japanese': 'ja-JP',
      'korean': 'ko-KR',
      'chinese': 'zh-CN'
    };
    return map[langName.toLowerCase()] || 'en-US';
  };

  const initSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Tu navegador actual no soporta el reconocimiento de voz. Esta función está optimizada y solo funciona correctamente en Google Chrome y Microsoft Edge.");
      return null;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = room?.language ? getLanguageCode(room.language) : 'en-US';

    recognition.onstart = () => {
      console.log("SpeechRecognition: onstart");
      setSpeechStatus('listening');
      if (startTimeoutRef.current) {
        clearTimeout(startTimeoutRef.current);
        startTimeoutRef.current = null;
      }
    };
    recognition.onaudiostart = () => {
      console.log("SpeechRecognition: onaudiostart");
    };
    recognition.onsoundstart = () => {
      console.log("SpeechRecognition: onsoundstart");
      setSpeechStatus('detecting_sound');
    };
    recognition.onspeechstart = () => {
      console.log("SpeechRecognition: onspeechstart");
      setSpeechStatus('speaking');
    };
    recognition.onspeechend = () => {
      console.log("SpeechRecognition: onspeechend");
      setSpeechStatus('processing');
    };
    recognition.onsoundend = () => {
      console.log("SpeechRecognition: onsoundend");
      setSpeechStatus('listening');
    };
    recognition.onnomatch = () => {
      console.log("SpeechRecognition: onnomatch");
      setSpeechStatus('no_match');
      setTimeout(() => setSpeechStatus('listening'), 2000);
    };

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let currentInterim = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          currentInterim += event.results[i][0].transcript;
        }
      }
      
      if (finalTranscript) {
        console.log("SpeechRecognition: final text: ", finalTranscript);
        setInput(prev => prev + (prev ? ' ' : '') + finalTranscript);
      }
      if (currentInterim) {
        console.log("SpeechRecognition: interim text: ", currentInterim);
      }
      setInterimResult(currentInterim);
    };

    recognition.onend = () => {
      console.log("SpeechRecognition: onend");
      setIsRecording(false);
      setSpeechStatus('idle');
      setInterimResult('');
      if (startTimeoutRef.current) {
        clearTimeout(startTimeoutRef.current);
        startTimeoutRef.current = null;
      }
    };

    recognition.onerror = (e) => {
      console.error("Speech recognition error:", e);
      if (startTimeoutRef.current) {
        clearTimeout(startTimeoutRef.current);
        startTimeoutRef.current = null;
      }
      if (e.error === 'network') {
        alert("Error de red en el reconocimiento de voz. Asegúrate de tener conexión a internet y de estar usando localhost o HTTPS (requerido por el navegador).");
      } else if (e.error === 'not-allowed') {
        alert("Acceso al micrófono denegado. Por favor, permite el acceso al micrófono en tu navegador.");
      } else if (e.error === 'audio-capture') {
        alert("Error de captura de audio: El navegador no puede acceder al hardware del micrófono. Asegúrate de que tienes un micrófono conectado, que no está desactivado en Windows, y que ninguna otra aplicación (como Zoom o Teams) lo está usando en exclusiva.");
      } else {
        alert("Error en el reconocimiento de voz: " + e.error);
      }
      setIsRecording(false);
      setSpeechStatus('idle');
      setInterimResult('');
    };

    return recognition;
  };

  const toggleRecording = () => {
    if (isRecording) {
      if (startTimeoutRef.current) {
        clearTimeout(startTimeoutRef.current);
        startTimeoutRef.current = null;
      }
      recognitionRef.current?.stop();
      setIsRecording(false);
      setSpeechStatus('idle');
    } else {
      try {
        if (!recognitionRef.current) {
          recognitionRef.current = initSpeechRecognition();
        }
        if (recognitionRef.current) {
          recognitionRef.current.start();
          setIsRecording(true);
          setSpeechStatus('idle');

          // Timeout to detect if the browser's speech engine hangs silently
          startTimeoutRef.current = setTimeout(() => {
            if (speechStatus === 'idle') {
              alert("El micrófono no responde. Recuerda que esta función nativa solo está soportada al 100% en Google Chrome y Microsoft Edge. Navegadores como Opera, Brave o Firefox bloquearán el acceso de voz.");
              recognitionRef.current?.stop();
              setIsRecording(false);
            }
          }, 4000);
        }
      } catch (e) {
        console.error("Error starting recognition:", e);
        alert("No se pudo iniciar el micrófono: " + e.message);
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

      const aiLanguage = localStorage.getItem('ai_language') || 'es';
      const response = await api.post('/api/chat/icebreaker', {
        room_id: room.id,
        language: room.language || "English",
        vocabulary_words: vocabWords,
        ai_language: aiLanguage
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
      const aiLanguage = localStorage.getItem('ai_language') || 'es';
      const res = await api.post('/api/chat/grammar-check', {
        message: input,
        language: room?.language || "English",
        ai_language: aiLanguage
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
    lists,
    interimResult,
    speechStatus,
    showParticipants,
    setShowParticipants,
    showRoomInfo,
    setShowRoomInfo,
    isEditingInfo,
    setIsEditingInfo,
    editData,
    setEditData,
    mentionQuery,
    setMentionQuery,
    inputRef,
    scrollContainerRef,
    startEditing,
    saveEditing,
    handleInputChange,
    handleMentionSelect,
    mentionSuggestions,
    fluidMode,
  };
};
