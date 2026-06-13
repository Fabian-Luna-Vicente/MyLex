import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaStar } from 'react-icons/fa';

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
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-md transition-opacity">
      <div className="bg-[#0e0c1d] border border-white/10 rounded-3xl shadow-[0_0_50px_rgba(0,195,255,0.15)] w-full max-w-md p-8 transform transition-all scale-100">
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-[#00c3ff]/20 to-[#0080ff]/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(0,195,255,0.3)]">
            <FaStar className="text-4xl text-[#00c3ff]" />
          </div>
          <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-[#00c3ff] mb-3">
            Funcionalidad Premium
          </h3>
          <p className="text-gray-300 font-medium leading-relaxed mb-8">
            {message}
          </p>
          <div className="flex w-full space-x-4">
            <button
              onClick={() => setIsOpen(false)}
              className="flex-1 px-4 py-3 bg-white/5 text-gray-300 border border-white/10 rounded-2xl font-bold hover:bg-white/10 hover:text-white transition-all"
            >
              Cerrar
            </button>
            <button
              onClick={handleUpgrade}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-[#00c3ff] to-blue-600 text-white rounded-2xl font-bold hover:scale-105 hover:shadow-[0_0_20px_rgba(0,195,255,0.4)] transition-all"
            >
              Descubrir Premium
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LimitExceededModal;
