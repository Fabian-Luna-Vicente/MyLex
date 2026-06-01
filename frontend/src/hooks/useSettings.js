import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';
import { profileService } from '../services/profileService';

export function useSettings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: true,
    language: 'en',
    privacy: 'Friends Only'
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await profileService.getMyProfile();
        if (profile) {
          setSettings(prev => ({ ...prev, language: profile.ai_language || 'en' }));
        }
      } catch (err) {
        console.error("Error fetching profile", err);
      }
    };
    fetchProfile();
  }, []);

  const handleLanguageChange = async (val) => {
    setSettings(prev => ({ ...prev, language: val }));
    try {
      await profileService.updateProfile({ ai_language: val });
    } catch (err) {
      console.error("Error updating AI language", err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSetting = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return {
    user,
    navigate,
    settings,
    handleLanguageChange,
    handleLogout,
    toggleSetting
  };
}
