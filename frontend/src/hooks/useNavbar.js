import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';

export function useNavbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCommunityOpen, setIsCommunityOpen] = useState(false);
  const [isVocabularyOpen, setIsVocabularyOpen] = useState(false);

  const isCommunityActive = ['/friends', '/search', '/chat'].includes(location.pathname);
  const isVocabularyActive = ['/lists', '/create-word'].includes(location.pathname);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return {
    user,
    navigate,
    location,
    isProfileOpen,
    setIsProfileOpen,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    isCommunityOpen,
    setIsCommunityOpen,
    isVocabularyOpen,
    setIsVocabularyOpen,
    isCommunityActive,
    isVocabularyActive,
    handleLogout,
    isActive
  };
}
