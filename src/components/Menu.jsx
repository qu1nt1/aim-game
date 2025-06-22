import React, { useState } from 'react';

export default function Menu({ onNavigate }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const handlePlayButtonClick = () => { setIsMenuOpen(prevState => !prevState); };

  return (
    <div className="menu-screen with-background">
      <button 
        className={`play-button ${isMenuOpen ? 'shifted' : ''}`}
        onClick={handlePlayButtonClick}
      >
        <img src="/play-btn2.png" alt="Play/Menu" />
      </button>

      <div className={`options-container ${isMenuOpen ? 'visible' : ''}`}>
        <button onClick={() => onNavigate('song-selection')}>JOGAR</button>
        <button onClick={() => onNavigate('practice')}>PRATIQUE</button>
        <button onClick={() => onNavigate('controls')}>CONTROLES</button>
        <button onClick={() => onNavigate('tutorial')}>SOBRE</button>
      </div>
    </div>
  );
}