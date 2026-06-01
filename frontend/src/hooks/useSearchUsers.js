import { useState } from 'react';
import { profileService } from '../services/profileService';

export function useSearchUsers() {
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearchLoading(true);
    try {
      const data = await profileService.searchUsers(searchQuery);
      setSearchResults(data);
    } catch (e) {
      console.error(e);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSendRequest = async (userId) => {
    try {
      await profileService.sendFriendRequest(userId);
      setSearchResults(prev => prev.map(u =>
        u.user_id === userId ? { ...u, request_status: 'pending' } : u
      ));
    } catch (e) {
      console.error(e);
    }
  };

  return {
    searchResults,
    searchQuery,
    setSearchQuery,
    searchLoading,
    handleSearch,
    handleSendRequest
  };
}
