import { useContext } from 'react';
import { AiContext } from '../contexts/AiContext';

export const useAi = () => {
  const context = useContext(AiContext);
  if (!context) {
    throw new Error('useAi must be used within an AiProvider');
  }
  return context;
};
