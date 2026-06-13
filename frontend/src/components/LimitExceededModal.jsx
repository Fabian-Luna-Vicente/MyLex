import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const LimitExceededModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleLimitExceeded = (e) => {
      setMessage(e.detail || 'Has alcanzado el límite de uso de tu plan actual.');
      setIsOpen(true);
    };

    window.addEventListener('limit:exceeded', handleLimitExceeded);
    return () => window.removeEventListener('limit:exceeded', handleLimitExceeded);
  }, []);

  if (!isOpen) return null;

  const handleUpgrade = () => {
    setIsOpen(false);
    navigate('/premium');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm transition-opacity">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6 transform transition-all scale-100">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            ¡Límite Alcanzado!
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {message}
          </p>
          <div className="flex w-full space-x-3">
            <button
              onClick={() => setIsOpen(false)}
              className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Cerrar
            </button>
            <button
              onClick={handleUpgrade}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-colors shadow-md"
            >
              Mejorar Plan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LimitExceededModal;
