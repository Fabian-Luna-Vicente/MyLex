import { useState, useEffect } from 'react';
import { profileService } from '../services/profileService';

export function useFriends() {
  const [tab, setTab] = useState('friends'); // friends, requests, search
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFriends();
    loadRequests();
  }, []);

  const loadFriends = async () => {
    try {
      const data = await profileService.getFriends();
      setFriends(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadRequests = async () => {
    try {
      const data = await profileService.getPendingRequests();
      setRequests(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleRespondRequest = async (requestId, action) => {
    try {
      await profileService.respondToRequest(requestId, action);
      setRequests(prev => prev.filter(r => r.id !== requestId));
      if (action === 'accept') loadFriends();
    } catch (e) {
      console.error(e);
    }
  };

  return {
    tab,
    setTab,
    friends,
    requests,
    loading,
    handleRespondRequest
  };
}
