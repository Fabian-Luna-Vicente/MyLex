import { useState, useEffect } from 'react';
import { profileService } from '../services/profileService';
import { vocabularyService } from '../services/vocabularyService';

export function useUserProfile(userId) {
  const [profile, setProfile] = useState(null);
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const data = await profileService.getUserProfile(userId);
      setProfile(data);
      const userLists = await vocabularyService.getUserLists(userId);
      setLists(userLists);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async () => {
    setActionLoading(true);
    try {
      await profileService.sendFriendRequest(userId);
      setProfile(prev => ({ ...prev, request_status: 'pending' }));
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveFriend = async () => {
    setActionLoading(true);
    try {
      await profileService.removeFriend(userId);
      setProfile(prev => ({
        ...prev,
        is_friend: false,
        request_status: null,
        friend_count: prev.friend_count - 1
      }));
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  return {
    profile,
    lists,
    loading,
    actionLoading,
    handleSendRequest,
    handleRemoveFriend
  };
}
