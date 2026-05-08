import React, { useState, useEffect } from "react"
import Login from "./components/Login"

function IndexPopup() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    chrome.storage.local.get(['access_token'], (result) => {
      if (result.access_token) {
        setIsLoggedIn(true);
      }
      setChecking(false);
    });
  }, []);

  const handleLogout = () => {
    chrome.storage.local.remove(['access_token'], () => {
      setIsLoggedIn(false);
    });
  };

  if (checking) return <div style={{ padding: 20, color: 'white', background: '#0e0c1d' }}>Checking...</div>;

  return (
    <div style={{ width: "280px", background: "#0e0c1d", color: "white", fontFamily: 'sans-serif' }}>
      {!isLoggedIn ? (
        <Login onLoginSuccess={() => setIsLoggedIn(true)} />
      ) : (
        <div style={{ padding: '20px' }}>
          <h2 style={{ color: '#00c3ff', margin: '0 0 10px 0', fontSize: '1.4rem' }}>MyLex</h2>
          <p style={{ fontSize: '0.85rem', color: '#aaa', lineHeight: '1.4' }}>
            La extensión está activa y conectada. Selecciona texto en cualquier web para añadirlo a tu vocabulario.
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
            <button 
              onClick={() => window.open("http://localhost:5173/dashboard", "_blank")}
              style={{
                  background: "linear-gradient(to right, #00c3ff, #0080ff)", 
                  border: "none", padding: "12px", 
                  width: "100%", cursor: "pointer", fontWeight: "bold", color: '#000',
                  borderRadius: '8px'
              }}>
              Ir al Dashboard
            </button>
            
            <button 
              onClick={handleLogout}
              style={{
                  background: "transparent", border: "none", padding: "10px", 
                  width: "100%", cursor: "pointer", color: '#ff4d4d',
                  fontSize: '0.8rem', marginTop: '10px'
              }}>
              Cerrar Sesión
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default IndexPopup