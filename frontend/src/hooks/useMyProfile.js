import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileService } from '../services/profileService';
import { vocabularyService } from '../services/vocabularyService';
import { AuthContext } from '../contexts/AuthContext';

export function useMyProfile() {
  const navigate = useNavigate();
  const { user, setUser } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await profileService.getMyProfile();
      setProfile(data);
      const userLists = await vocabularyService.getUserLists(data.user_id);
      setLists(userLists);
      setForm({
        username: data.username || '',
        bio: data.bio || '',
        country: data.country || '',
        native_language: data.native_language || '',
        learning_languages: data.learning_languages || [],
        level: data.level || 'Beginner',
        avatar_url: data.avatar_url || ''
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await profileService.updateProfile(form);
      setProfile(updated);
      setEditing(false);
      
      // Update global user object
      if (user && form.username && user.username !== form.username) {
        const updatedUser = { ...user, username: form.username };
        setUser(updatedUser);
        localStorage.setItem('mylex_user', JSON.stringify(updatedUser));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const toggleLanguage = (lang) => {
    setForm(prev => {
      const langs = prev.learning_languages || [];
      if (langs.includes(lang)) {
        return { ...prev, learning_languages: langs.filter(l => l !== lang) };
      }
      return { ...prev, learning_languages: [...langs, lang] };
    });
  };

  return {
    navigate,
    profile,
    lists,
    loading,
    editing,
    setEditing,
    form,
    setForm,
    saving,
    handleSave,
    toggleLanguage
  };
}
