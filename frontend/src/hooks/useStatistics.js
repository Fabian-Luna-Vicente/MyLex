import { useState, useEffect } from 'react';
import { progressService } from '../services/progressService';
import { useVocabulary } from './useVocabulary';

export function useStatistics() {
  const { lists, fetchLists } = useVocabulary();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([]);
  const [overall, setOverall] = useState(null);

  // Filters
  const [filters, setFilters] = useState({
    game: '',
    list_id: '',
    word_type: '',
    start_date: '',
    end_date: ''
  });

  useEffect(() => {
    fetchLists();
    loadOverall();
    loadDetailed();
  }, []);

  const loadOverall = async () => {
    try {
      const data = await progressService.getOverallStats();
      setOverall(data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadDetailed = async () => {
    setLoading(true);
    try {
      const data = await progressService.getDetailedStats(filters);
      setStats(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    loadDetailed();
  };

  const activityData = overall?.recent_activity?.map(a => ({
    date: new Date(a.date).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' }),
    count: a.count
  })) || [];

  const randomData = overall?.random_distribution ? Object.entries(overall.random_distribution).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value
  })) : [];

  return {
    lists,
    loading,
    stats,
    overall,
    filters,
    handleFilterChange,
    applyFilters,
    activityData,
    randomData
  };
}
