import { useState, useEffect } from 'react';
import { chatService } from '../services/chatService';

export function useAIPersonas() {
  const [personas, setPersonas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form
  const [name, setName] = useState('');
  const [personality, setPersonality] = useState('');
  const [gender, setGender] = useState('female');
  const [avatarUrl, setAvatarUrl] = useState('');

  const loadPersonas = async () => {
    try {
      const data = await chatService.getAIPersonas();
      setPersonas(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPersonas();
  }, []);

  const handleCreateOrUpdate = async () => {
    if (!name || !personality) return;
    try {
      const data = {
        name,
        personality,
        gender,
        avatar_url: avatarUrl || null
      };

      if (editingId) {
        await chatService.updateAIPersona(editingId, data);
      } else {
        await chatService.createAIPersona(data);
      }

      handleCloseForm();
      loadPersonas();
    } catch (e) {
      console.error(e);
    }
  };

  const handleEdit = (p) => {
    setEditingId(p.id);
    setName(p.name);
    setPersonality(p.personality);
    setGender(p.gender);
    setAvatarUrl(p.avatar_url || '');
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingId(null);
    setName('');
    setPersonality('');
    setGender('female');
    setAvatarUrl('');
  };

  const handleDelete = async (id) => {
    try {
      await chatService.deleteAIPersona(id);
      loadPersonas();
    } catch (e) {
      console.error(e);
    }
  };

  return {
    personas,
    loading,
    showForm,
    setShowForm,
    editingId,
    setEditingId,
    name,
    setName,
    personality,
    setPersonality,
    gender,
    setGender,
    avatarUrl,
    setAvatarUrl,
    handleCreateOrUpdate,
    handleEdit,
    handleCloseForm,
    handleDelete
  };
}
