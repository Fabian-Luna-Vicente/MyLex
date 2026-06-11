import { useState, useRef, useCallback, useEffect } from 'react';
import api from '../services/api';

const LANGUAGE_CODES = {
  'english': 'en-US', 'spanish': 'es-ES', 'french': 'fr-FR',
  'german': 'de-DE', 'italian': 'it-IT', 'portuguese': 'pt-BR',
  'russian': 'ru-RU', 'japanese': 'ja-JP', 'korean': 'ko-KR', 'chinese': 'zh-CN'
};

function getLangCode(langName) {
  return LANGUAGE_CODES[langName?.toLowerCase()] || 'en-US';
}

export function useFluidMode({ room, user, wsRef, vocabData }) {
  const [isFluidMode, setIsFluidMode] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [currentSpeaker, setCurrentSpeaker] = useState(null); // user_id string
  const [handQueue, setHandQueue] = useState([]); // [{user_id, username, timestamp}]
  const [selectedAIs, setSelectedAIs] = useState([]); // participant ids
  const [subtitlesEnabled, setSubtitlesEnabled] = useState(
    () => localStorage.getItem('fluid_subtitles') === 'true'
  );
  const [currentSubtitle, setCurrentSubtitle] = useState('');
  const [lastAIText, setLastAIText] = useState('');
  const [lastAISpeakerName, setLastAISpeakerName] = useState('');
  const [lastAISpeakerName, setLastAISpeakerName] = useState('');
  const [isFluidMicActive, setIsFluidMicActive] = useState(false);
  const [isDirectAudioEnabled, setIsDirectAudioEnabled] = useState(
    () => localStorage.getItem('fluid_direct_audio') === 'true'
  );

  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const currentAudioRef = useRef(null);
  const subtitleIntervalRef = useRef(null);
  const currentTranscriptRef = useRef('');
  const spokenMessageIds = useRef(new Set());
  const subtitlesEnabledRef = useRef(subtitlesEnabled);

  // Keep ref in sync with state so speakWithSubtitles always uses latest value
  useEffect(() => {
    subtitlesEnabledRef.current = subtitlesEnabled;
  }, [subtitlesEnabled]);

  const isBlocked = isAISpeaking || isAIThinking;

  // ─── WebSocket broadcast ─────────────────────────────────────────────────────
  const broadcastFluidSignal = useCallback((signal) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ ...signal, _fluid_signal: true }));
    }
  }, [wsRef]);

  // ─── TTS with subtitle sync ──────────────────────────────────────────────────
  const speakWithSubtitles = useCallback((text, speakerName) => {
    if (!window.speechSynthesis || !text) return;
    window.speechSynthesis.cancel();
    if (subtitleIntervalRef.current) clearInterval(subtitleIntervalRef.current);

    setLastAIText(text);
    setLastAISpeakerName(speakerName || '');
    setIsAISpeaking(true);
    setIsAIThinking(false);
    setCurrentSubtitle('');

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = getLangCode(room?.language);

    // Subtitle sync (~8 chars/s average speech = 40ms per 3 chars)
    if (subtitlesEnabledRef.current) {
      let charIdx = 0;
      subtitleIntervalRef.current = setInterval(() => {
        charIdx += 3;
        setCurrentSubtitle(text.slice(0, Math.min(charIdx, text.length)));
        if (charIdx >= text.length) clearInterval(subtitleIntervalRef.current);
      }, 40);
    }

    const cleanup = () => {
      setIsAISpeaking(false);
      setCurrentSubtitle('');
      if (subtitleIntervalRef.current) clearInterval(subtitleIntervalRef.current);
    };
    utterance.onend = cleanup;
    utterance.onerror = cleanup;

    window.speechSynthesis.speak(utterance);
  }, [room]);

  // ─── Auto-grant floor when unblocked and queue has people ───────────────────
  useEffect(() => {
    if (!isFluidMode || isBlocked || handQueue.length === 0 || currentSpeaker) return;
    const next = handQueue[0];
    
    // Each client: if it's MY turn, wait a small buffer to prevent race conditions
    // If a delayed packet arrives from someone else with an older timestamp, 
    // handQueue will change, clearing this timeout and preventing the collision.
    if (next.user_id === user?.id) {
      const timeoutId = setTimeout(() => {
        setCurrentSpeaker(user.id);
        setHandQueue(prev => prev.filter(h => h.user_id !== user.id));
        broadcastFluidSignal({ type: 'fluid_floor_granted', user_id: user.id });
      }, 600); // 600ms buffer delay
      
      return () => clearTimeout(timeoutId);
    }
  }, [isBlocked, handQueue, currentSpeaker, isFluidMode, user, broadcastFluidSignal]);

  // ─── Handle incoming WS fluid signals from other users ──────────────────────
  const handleFluidSignal = useCallback((signal) => {
    switch (signal.type) {
      case 'fluid_hand_raise':
        setHandQueue(prev => {
          if (prev.find(h => h.user_id === signal.user_id)) return prev;
          return [...prev, { user_id: signal.user_id, username: signal.username, timestamp: signal.timestamp }]
            .sort((a, b) => a.timestamp - b.timestamp);
        });
        break;
      case 'fluid_hand_lower':
        setHandQueue(prev => prev.filter(h => h.user_id !== signal.user_id));
        break;
      case 'fluid_floor_granted':
        setCurrentSpeaker(signal.user_id);
        setHandQueue(prev => prev.filter(h => h.user_id !== signal.user_id));
        break;
      case 'fluid_floor_released':
        setCurrentSpeaker(null);
        break;
      case 'fluid_audio_response':
        if (spokenMessageIds.current.has(signal.ai_id + signal.text)) return;
        spokenMessageIds.current.add(signal.ai_id + signal.text);
        
        // Play the base64 audio
        try {
          const audioUrl = `data:audio/webm;base64,${signal.audio_b64}`;
          const audio = new Audio(audioUrl);
          currentAudioRef.current = audio;
          
          setIsAISpeaking(true);
          setIsAIThinking(false);
          setLastAIText(signal.text);
          setLastAISpeakerName(signal.participant?.name_display || 'AI');
          
          if (subtitlesEnabledRef.current && signal.text) {
            let charIdx = 0;
            setCurrentSubtitle('');
            subtitleIntervalRef.current = setInterval(() => {
              charIdx += 3;
              setCurrentSubtitle(signal.text.slice(0, Math.min(charIdx, signal.text.length)));
              if (charIdx >= signal.text.length) clearInterval(subtitleIntervalRef.current);
            }, 40);
          } else {
            setCurrentSubtitle(signal.text);
          }
          
          audio.onended = () => {
            setIsAISpeaking(false);
            setCurrentSubtitle('');
            if (subtitleIntervalRef.current) clearInterval(subtitleIntervalRef.current);
          };
          audio.play();
        } catch (e) {
          console.error("Error playing AI audio response:", e);
        }
        break;
      default: break;
    }
  }, []);

  // ─── Handle AI message arriving via WS (for other users in the room) ────────
  const handleIncomingAIMessage = useCallback((msg) => {
    if (!isFluidMode) return;
    if (spokenMessageIds.current.has(msg.id)) return; // Already triggered via REST response
    spokenMessageIds.current.add(msg.id);
    speakWithSubtitles(msg.content, msg.participant?.name_display);
  }, [isFluidMode, speakWithSubtitles]);

  // ─── Queue actions ───────────────────────────────────────────────────────────
  const raiseHand = useCallback(() => {
    const entry = { user_id: user?.id, username: user?.username, timestamp: Date.now() };
    setHandQueue(prev => {
      if (prev.find(h => h.user_id === user?.id)) return prev;
      return [...prev, entry].sort((a, b) => a.timestamp - b.timestamp);
    });
    broadcastFluidSignal({ type: 'fluid_hand_raise', ...entry });
  }, [user, broadcastFluidSignal]);

  const lowerHand = useCallback(() => {
    setHandQueue(prev => prev.filter(h => h.user_id !== user?.id));
    broadcastFluidSignal({ type: 'fluid_hand_lower', user_id: user?.id });
  }, [user, broadcastFluidSignal]);

  // ─── AI selection (who responds) ─────────────────────────────────────────────
  const toggleAISelection = useCallback((participantId) => {
    setSelectedAIs(prev =>
      prev.includes(participantId)
        ? prev.filter(id => id !== participantId)
        : [...prev, participantId]
    );
  }, []);

  // ─── Direct Audio / Recognition ──────────────────────────────────────────────
  const toggleDirectAudio = useCallback(() => {
    setIsDirectAudioEnabled(prev => {
      const next = !prev;
      localStorage.setItem('fluid_direct_audio', String(next));
      return next;
    });
  }, []);

  const startRecognition = useCallback(async () => {
    if (isDirectAudioEnabled) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
        audioChunksRef.current = [];
        
        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };
        
        mediaRecorder.onstop = () => {
          stream.getTracks().forEach(track => track.stop());
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          
          // Convert Blob to Base64
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = () => {
            const base64data = reader.result.split(',')[1];
            if (base64data && wsRef.current?.readyState === WebSocket.OPEN) {
              const aiParticipants = room.participants.filter(p => p.is_ai);
              const targetAIs = selectedAIs.length > 0 ? selectedAIs : aiParticipants.length === 1 ? [aiParticipants[0].id] : [];
              if (targetAIs.length > 0) {
                setIsAIThinking(true);
                wsRef.current.send(JSON.stringify({
                  _fluid_audio_request: true,
                  audio_b64: base64data,
                  mime_type: 'audio/webm',
                  ai_id: targetAIs[0]
                }));
              }
            }
          };
        };
        
        mediaRecorderRef.current = mediaRecorder;
        mediaRecorder.start();
      } catch (err) {
        console.error("Microphone access denied or error:", err);
        setIsFluidMicActive(false);
      }
    } else {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) return;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = getLangCode(room?.language);
      currentTranscriptRef.current = '';
  
      recognition.onresult = (event) => {
        let final = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) final += event.results[i][0].transcript;
        }
        if (final) currentTranscriptRef.current += (currentTranscriptRef.current ? ' ' : '') + final;
      };
      recognition.onerror = (e) => {
        console.error('Fluid mic error:', e.error);
        setIsFluidMicActive(false);
      };
      recognition.onend = () => {};
      recognitionRef.current = recognition;
      try { recognition.start(); } catch (e) { console.error('Recognition start error:', e); }
    }
  }, [room, isDirectAudioEnabled, selectedAIs, wsRef]);

  const stopRecognition = useCallback(() => {
    if (isDirectAudioEnabled) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      mediaRecorderRef.current = null;
    } else {
      try { recognitionRef.current?.stop(); } catch (e) {}
      recognitionRef.current = null;
    }
  }, [isDirectAudioEnabled]);

  // ─── Mic control ─────────────────────────────────────────────────────────────
  const activateMic = useCallback(() => {
    if (isBlocked || currentSpeaker !== user?.id) return;
    currentTranscriptRef.current = '';
    setIsFluidMicActive(true);
    startRecognition();
  }, [isBlocked, currentSpeaker, user, startRecognition]);

  const deactivateMic = useCallback(() => {
    stopRecognition();
    setIsFluidMicActive(false);
    const transcript = currentTranscriptRef.current.trim();

    // Release floor before sending (so others can queue)
    setCurrentSpeaker(null);
    broadcastFluidSignal({ type: 'fluid_floor_released' });

    if (!isDirectAudioEnabled && transcript) {
      sendFluidMessage(transcript);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stopRecognition, broadcastFluidSignal, isDirectAudioEnabled]);

  // ─── Send message to AI ──────────────────────────────────────────────────────
  const sendFluidMessage = useCallback(async (text) => {
    if (!text.trim() || !room?.participants?.some(p => p.is_ai)) return;
    setIsAIThinking(true);
    try {
      const contextWords = [];
      vocabData?.forEach(list =>
        list.words?.forEach(w => {
          if (w.usage_count === 0 && contextWords.length < 3) contextWords.push(w.name);
        })
      );
      const aiLanguage = localStorage.getItem('ai_language') || 'es';
      // If no AIs selected and only 1 AI exists, target that AI; otherwise use selection
      const aiParticipants = room.participants.filter(p => p.is_ai);
      const targetAIs = selectedAIs.length > 0 ? selectedAIs
        : aiParticipants.length === 1 ? [aiParticipants[0].id]
        : [];

      const res = await api.post('/api/chat/ai/message', {
        room_id: room.id,
        message: text,
        context_words: contextWords,
        mentioned_ai_participant_ids: targetAIs,
        ai_language: aiLanguage
      });

      const newMsgs = res.data;
      const aiMsgs = newMsgs.filter(m => m.participant?.is_ai);
      if (aiMsgs.length > 0) {
        const lastAi = aiMsgs[aiMsgs.length - 1];
        // Mark as spoken so incoming WS broadcast doesn't double-play
        aiMsgs.forEach(m => spokenMessageIds.current.add(m.id));
        speakWithSubtitles(lastAi.content, lastAi.participant?.name_display);
      } else {
        setIsAIThinking(false);
      }
    } catch (e) {
      console.error('Fluid send error:', e);
      setIsAIThinking(false);
    }
  }, [room, selectedAIs, vocabData, speakWithSubtitles]);

  // ─── Replay last AI audio ─────────────────────────────────────────────────────
  const replayLastAudio = useCallback(() => {
    if (!lastAIText || isBlocked) return;
    speakWithSubtitles(lastAIText, lastAISpeakerName);
  }, [lastAIText, lastAISpeakerName, isBlocked, speakWithSubtitles]);

  // ─── Subtitle toggle ──────────────────────────────────────────────────────────
  const toggleSubtitles = useCallback(() => {
    setSubtitlesEnabled(prev => {
      const next = !prev;
      localStorage.setItem('fluid_subtitles', String(next));
      return next;
    });
  }, []);

  // ─── Enter / Exit ─────────────────────────────────────────────────────────────
  const enterFluidMode = useCallback(() => {
    const humanParticipants = room?.participants?.filter(p => !p.is_ai) || [];
    spokenMessageIds.current.clear();
    setIsFluidMode(true);
    setSelectedAIs([]);
    setHandQueue([]);
    setIsAISpeaking(false);
    setIsAIThinking(false);
    setCurrentSubtitle('');
    setIsFluidMicActive(false);
    currentTranscriptRef.current = '';
    // Auto-grant floor if solo human
    if (humanParticipants.length <= 1) {
      setCurrentSpeaker(user?.id || null);
    } else {
      setCurrentSpeaker(null);
    }
  }, [room, user]);

  const exitFluidMode = useCallback(() => {
    window.speechSynthesis?.cancel();
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    stopRecognition();
    if (subtitleIntervalRef.current) clearInterval(subtitleIntervalRef.current);
    broadcastFluidSignal({ type: 'fluid_floor_released' });
    setIsFluidMode(false);
    setIsFluidMicActive(false);
    setIsAISpeaking(false);
    setIsAIThinking(false);
    setCurrentSubtitle('');
    setHandQueue([]);
    setCurrentSpeaker(null);
  }, [stopRecognition, broadcastFluidSignal]);

  return {
    isFluidMode,
    isAISpeaking,
    isAIThinking,
    isBlocked,
    currentSpeaker,
    handQueue,
    selectedAIs,
    subtitlesEnabled,
    currentSubtitle,
    lastAIText,
    lastAISpeakerName,
    isFluidMicActive,
    isDirectAudioEnabled,
    raiseHand,
    lowerHand,
    toggleAISelection,
    activateMic,
    deactivateMic,
    replayLastAudio,
    toggleSubtitles,
    toggleDirectAudio,
    enterFluidMode,
    exitFluidMode,
    handleFluidSignal,
    handleIncomingAIMessage,
  };
}
