import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { chatService } from '../services/chatService';

export function useChatList() {
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

  return {
    navigate,
    rooms,
    loading,
    showCreateModal,
    setShowCreateModal,
    showAIPersonasModal,
    setShowAIPersonasModal,
    handleChatCreated
  };
}
