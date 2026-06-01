import React from 'react';
import { useVerifyEmail } from '../hooks/useVerifyEmail';

export default function VerifyEmail() {
  const {
    status,
    message,
    navigate
  } = useVerifyEmail();

  return (
    <div className="min-h-screen bg-[#071320] flex items-center justify-center p-4 relative overflow-hidden font-sans z-[1]">

      {/* Glows de fondo */}
      <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-[#00c3ff]/10 rounded-full blur-[150px] pointer-events-none z-0"></div>

      <div className="w-full max-w-md bg-[#0e0c1d]/80 backdrop-blur-[15px] p-8 md:p-10 rounded-[25px] border border-[#00c3ff]/30 shadow-[0_10px_40px_rgba(0,0,0,0.8)] text-center relative z-10">

        {status === 'verifying' && (
          <div className="flex flex-col items-center">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-[#00c3ff] border-t-transparent shadow-[0_0_15px_rgba(0,195,255,0.5)] mb-6"></div>
            <h2 className="text-[1.8rem] font-bold text-white mb-2 drop-shadow-[0_0_10px_rgba(0,195,255,0.5)]">
              Verifying Email...
            </h2>
            <p className="text-[#a0a0a0]">Please wait while we confirm your account.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center">
            <div className="h-20 w-20 bg-[#00c3ff]/10 border border-[#00c3ff]/30 text-[#00c3ff] rounded-full flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(0,195,255,0.2)]">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-[1.8rem] font-bold text-white mb-2 drop-shadow-[0_0_10px_rgba(0,195,255,0.5)]">
              Verified!
            </h2>
            <p className="text-[#a0a0a0] mb-8">{message}</p>
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-3.5 bg-[#00c3ff]/10 border border-[#00c3ff]/50 hover:bg-[#00c3ff]/20 text-[#00c3ff] rounded-full font-bold uppercase tracking-widest text-sm transition-all duration-300 hover:shadow-[0_0_15px_rgba(0,195,255,0.4)]"
            >
              Go to Login
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center">
            <div className="h-20 w-20 bg-blue-600/10 border border-blue-500/30 text-blue-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(59,130,246,0.2)]">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-[1.8rem] font-bold text-white mb-2 drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]">
              Verification Failed
            </h2>
            <p className="text-[#a0a0a0] mb-8">{message}</p>
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-3.5 bg-[#0e0c1d]/60 backdrop-blur-sm border border-blue-500/50 hover:bg-blue-600/10 text-white rounded-full font-bold uppercase tracking-widest text-sm transition-all duration-300 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]"
            >
              Back to Login
            </button>
          </div>
        )}

      </div>
    </div>
  );
}