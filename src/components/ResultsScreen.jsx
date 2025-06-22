import React, { useState } from 'react';
import { saveScore } from '../scoreManager';

export default function ResultsScreen({ stats, beatmap, onNavigate }) {
  const [playerName, setPlayerName] = useState('Player'); 

  if (!stats || !beatmap) {
    return (
      <div className="text-screen">
        <h2>Nenhuma estatística para mostrar.</h2>
        <button className="back-button" onClick={() => onNavigate('menu')}>
          Menu Principal
        </button>
      </div>
    );
  }

  const handleSaveScore = () => {
    saveScore(beatmap.id, playerName, stats.score, stats.playerMaxCombo);
    onNavigate('song-selection');
  };

  const formattedScore = stats.score.toLocaleString('en-US', {
    minimumIntegerDigits: 7, useGrouping: false
  });

  const accuracy = stats.totalJudgments > 0 ? (stats.hits / stats.totalJudgments * 100).toFixed(2) : "0.00";

  const backgroundStyle = {
      backgroundImage: `url(${beatmap.backgroundImageUrl})`,
      filter: 'brightness(0.4)',
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
      backgroundSize: 'cover', backgroundPosition: 'center', zIndex: 1
  };

  return (
    <div className="results-screen">
      <div className="results-background" style={backgroundStyle} />
      
      <div className="results-content">
        <div className={`grade-letter grade-${stats.grade.toLowerCase()}`}>{stats.grade}</div>
        
        <div className="stats-container">
          <div className="final-score">{formattedScore}</div>
          <div className="accuracy-display">Precisão: {accuracy}%</div>
          <div className="judgement-counts">
            <span>Acertos: {stats.hits}</span> | <span>Erros: {stats.misses}</span>
          </div>
          <div className="final-combo">Combo Máximo: <span>{stats.playerMaxCombo}x</span></div>
        </div>

        <div className="name-entry-container">
          <input 
            type="text" value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            maxLength={15}
          />
          <button onClick={handleSaveScore}>Salvar Pontuação</button>
        </div>
      </div>
    </div>
  );
}