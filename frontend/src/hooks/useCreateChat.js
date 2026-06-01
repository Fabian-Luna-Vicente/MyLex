import { useState, useEffect } from 'react';
import { chatService } from '../services/chatService';
import { profileService } from '../services/profileService';

export function useCreateChat(onSuccess) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [friends, setFriends] = useState([]);
  const [aiPersonas, setAiPersonas] = useState([]);

  // Room details
  const [roomName, setRoomName] = useState('New Adventure');
  const [description, setDescription] = useState('');
  const [context, setContext] = useState('');
  const [language, setLanguage] = useState('English');

  // Participants
  const [participants, setParticipants] = useState([]);

  // Sub-forms
  const [showAddAI, setShowAddAI] = useState(false);
  const [showAddHuman, setShowAddHuman] = useState(false);

  // AI Form State
  const [aiName, setAiName] = useState('Assistant');
  const [aiGender, setAiGender] = useState('female');
  const [aiPersonality, setAiPersonality] = useState('Friendly and helpful');
  const [aiRole, setAiRole] = useState('Guide');

  useEffect(() => {
    profileService.getFriends().then(setFriends).catch(console.error);
    chatService.getAIPersonas().then(setAiPersonas).catch(console.error);
  }, []);

  const handleAddAI = (persona, role) => {
    if (participants.find(p => p.is_ai && p.ai_name === persona.name)) return;
    setParticipants([...participants, {
      is_ai: true,
      ai_name: persona.name,
      ai_gender: persona.gender,
      ai_personality: persona.personality,
      ai_avatar_url: persona.avatar_url,
      role: role || 'AI Companion'
    }]);
    setShowAddAI(false);
  };

  const handleAddHuman = (friend, role) => {
    if (participants.find(p => p.user_id === friend.user_id)) return;
    setParticipants([...participants, {
      is_ai: false,
      user_id: friend.user_id,
      name_display: friend.username,
      avatar_display: friend.avatar_url,
      role: role || 'Participant'
    }]);
    setShowAddHuman(false);
  };

  const removeParticipant = (index) => {
    setParticipants(participants.filter((_, i) => i !== index));
  };

  const handleCreate = async () => {
    setLoading(true);
    try {
      const data = {
        name: roomName,
        description,
        context,
        language,
        initial_participants: participants.map(p => ({
          user_id: p.user_id,
          is_ai: p.is_ai,
          ai_name: p.ai_name,
          ai_gender: p.ai_gender,
          ai_personality: p.ai_personality,
          ai_avatar_url: p.ai_avatar_url,
          role: p.role
        }))
      };
      const room = await chatService.createRoom(data);
      onSuccess(room);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return {
    step,
    setStep,
    loading,
    friends,
    aiPersonas,
    roomName,
    setRoomName,
    description,
    setDescription,
    context,
    setContext,
    language,
    setLanguage,
    participants,
    showAddAI,
    setShowAddAI,
    showAddHuman,
    setShowAddHuman,
    aiName,
    setAiName,
    aiGender,
    setAiGender,
    aiPersonality,
    setAiPersonality,
    aiRole,
    setAiRole,
    handleAddAI,
    handleAddHuman,
    removeParticipant,
    handleCreate
  };
}
