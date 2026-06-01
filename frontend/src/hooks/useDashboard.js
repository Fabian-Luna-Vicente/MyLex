import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';
import { useVocabulary } from './useVocabulary';
import { progressService } from '../services/progressService';

export function useDashboard() {
  const { user, logout } = useAuth();
  const { words, lists, fetchWords, fetchLists, loading } = useVocabulary();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchWords();
    fetchLists();
    loadStats();
  }, [fetchWords, fetchLists]);

  const loadStats = async () => {
    try {
      const data = await progressService.getOverallStats();
      setStats(data);
    } catch (e) {
      console.error("Dashboard stats error:", e);
    }
  };

  const activityData = stats?.recent_activity?.map(a => ({
    date: new Date(a.date).toLocaleDateString(undefined, { weekday: 'short' }),
    count: a.count
  })) || [];

  return {
    user,
    logout,
    words,
    lists,
    loading,
    navigate,
    stats,
    activityData
  };
}
