import React from 'react';
import { useLogin } from '../hooks/useLogin';
import { CONFIG } from '../config/constants';

export default function Login({ onLoginSuccess }) {
  const {
    email,
    setEmail,
    password,
    setPassword,
    handleLogin,
    loading,
    error
  } = useLogin(onLoginSuccess);

  return (
    <div style={{ padding: '15px', color: 'white' }}>
      <h3 style={{ marginTop: 0, color: '#00c3ff', fontSize: '1.2rem' }}>MyLex Assistant</h3>
      <p style={{ fontSize: '0.8rem', color: '#aaa', marginBottom: '15px' }}>Inicia sesión para usar la extensión.</p>
      
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input 
          type="email" 
          placeholder="Email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)}
          style={{ 
            padding: '10px', 
            borderRadius: '8px', 
            border: '1px solid #333', 
            background: '#111', 
            color: '#fff',
            outline: 'none'
          }}
          required
        />
        <input 
          type="password" 
          placeholder="Contraseña" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)}
          style={{ 
            padding: '10px', 
            borderRadius: '8px', 
            border: '1px solid #333', 
            background: '#111', 
            color: '#fff',
            outline: 'none'
          }}
          required
        />
        {error && <p style={{ color: '#ff4d4d', fontSize: '0.75rem', margin: 0 }}>{error}</p>}
        
        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            padding: '12px', 
            background: 'linear-gradient(to right, #00c3ff, #0080ff)', 
            border: 'none', 
            borderRadius: '8px', 
            color: '#000', 
            fontWeight: 'bold',
            cursor: 'pointer',
            marginTop: '5px',
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? 'Cargando...' : 'Iniciar Sesión'}
        </button>
      </form>
      
      <div style={{ marginTop: '15px', textAlign: 'center' }}>
        <a 
          href={CONFIG.DASHBOARD_URL} 
          target="_blank" 
          rel="noreferrer"
          style={{ color: '#00c3ff', fontSize: '0.75rem', textDecoration: 'none' }}
        >
          Ir a la web principal
        </a>
      </div>
    </div>
  );
}
