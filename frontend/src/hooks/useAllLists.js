import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVocabulary } from './useVocabulary';
import { usePaginate } from './usePaginate';

export function useAllLists() {
  const navigate = useNavigate();
  const { lists, fetchLists, addList, loading } = useVocabulary();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    fetchLists();
  }, [fetchLists]);

  const { currentItems, totalPages } = usePaginate(currentPage, itemsPerPage, lists);

  const handleCreateList = async (listData) => {
    await addList(listData);
  };

  return {
    navigate,
    lists,
    loading,
    isModalOpen,
    setIsModalOpen,
    currentPage,
    setCurrentPage,
    currentItems,
    totalPages,
    handleCreateList
  };
}
