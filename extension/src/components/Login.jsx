import React, { useState } from 'react';

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: email,
            password: password
        }),
      });

      const data = await response.json();

      if (response.ok && data.access_token) {
        chrome.runtime.sendMessage({ 
          action: "SET_TOKEN", 
          token: data.access_token 
        }, () => {
          onLoginSuccess();
        });
      } else {
        setError(data.detail || 'Login failed');
      }
    } catch (err) {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

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
          href="http://localhost:5173/dashboard" 
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
