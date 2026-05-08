import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

// 1. IMPORTAMOS TUS ARCHIVOS CSS EXISTENTES (con la magia de ?inline)
import translateStyles from './styles/translate.css?inline';
import lyricsStyles from './styles/LyricsAndWords.css?inline';
import imageSearchStyles from './styles/ImageSearch.css?inline';

// Importa tus componentes (asegúrate de que las rutas sean correctas)
import FloatingMenu from './components/FloatingMenu';
import GrammarCard from './components/GrammarCard';
import AddWordToList from './components/AddWordToList';

// --- COMPONENTE PRINCIPAL DE LA EXTENSIÓN ---
function ContentApp() {
  const [selectedText, setSelectedText] = useState('');
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [showMenu, setShowMenu] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'grammar' | 'addWord' | null

  useEffect(() => {
    const handleMouseUp = (e) => {
      if (e.target.closest('#drillexa-extension-root')) return;

      const selection = window.getSelection();
      const text = selection.toString().trim();

      if (text) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        setSelectedText(text);
        setMenuPosition({
          top: rect.bottom + window.scrollY + 10,
          left: rect.left + window.scrollX + (rect.width / 2),
        });
        setShowMenu(true);
      } else {
        setShowMenu(false);
      }
    };

    const handleMessage = (request, sender, sendResponse) => {
      if (request.action === "OPEN_ADD_WORD_MODAL") {
        setSelectedText(request.text);
        setActiveModal('addWord');
        setShowMenu(false);
      }
      if (request.action === "OPEN_GRAMMAR_CARD") {
        setSelectedText(request.text);
        setActiveModal('grammar');
        setShowMenu(false);
      }
    };

    document.addEventListener('mouseup', handleMouseUp);
    chrome.runtime.onMessage.addListener(handleMessage);

    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, []);

  return (
    <div className="drillexa-wrapper text-base font-sans">
      {/* Menú Flotante */}
      {showMenu && !activeModal && (
        <FloatingMenu
          position={menuPosition}
          text={selectedText}
          onAnalyze={() => setActiveModal('grammar')}
          onAdd={() => setActiveModal('addWord')}
          onClose={() => setShowMenu(false)}
        />
      )}

      {/* Modal de Gramática */}
      {activeModal === 'grammar' && (
        <GrammarCard
          text={selectedText}
          onClose={() => setActiveModal(null)}
        />
      )}

      {/* Modal para Añadir Palabra */}
      {activeModal === 'addWord' && (
        <AddWordToList
          word={selectedText}
          onClose={() => setActiveModal(null)}
        />
      )}
    </div>
  );
}

// --- LÓGICA DE INYECCIÓN Y SHADOW DOM ---
function init() {
  if (document.getElementById('drillexa-extension-root')) return;

  const appContainer = document.createElement('div');
  appContainer.id = 'drillexa-extension-root';
  appContainer.style.position = 'absolute';
  appContainer.style.top = '0';
  appContainer.style.left = '0';
  appContainer.style.zIndex = '2147483647';

  document.body.appendChild(appContainer);

  // Crear el Shadow DOM para aislar tus estilos de la web host
  const shadowRoot = appContainer.attachShadow({ mode: 'open' });

  // 2. INYECTAR TUS HOJAS DE ESTILO EN EL SHADOW DOM
  const stylesToInject = [translateStyles, lyricsStyles, imageSearchStyles];

  stylesToInject.forEach(cssText => {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = cssText;
    shadowRoot.appendChild(styleSheet);
  });

  const reactRoot = document.createElement('div');
  shadowRoot.appendChild(reactRoot);

  const root = createRoot(reactRoot);
  root.render(<ContentApp />);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}