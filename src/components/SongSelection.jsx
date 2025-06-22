import React, { useState, useEffect } from 'react';
import { beatmap1, beatmap2, beatmap3, beatmap4, beatmap5, beatmap6, beatmap7, beatmap8, beatmap9, beatmap10 } from '../beatmaps';
import { getScores } from '../scoreManager'; 

const allBeatmaps = [beatmap1, beatmap2, beatmap3, beatmap4, beatmap5, beatmap6, beatmap7, beatmap8, beatmap9, beatmap10 ];

export default function SongSelection({ onSongSelect, onNavigate }) {
  const [hoveredSong, setHoveredSong] = useState(allBeatmaps[0]);
  const [allScores, setAllScores] = useState({});

  // useEffect carregando os scores do localStorage 
  useEffect(() => {
    setAllScores(getScores());
  }, []);

  const backgroundStyle = {
    backgroundImage: `url(${hoveredSong ? hoveredSong.backgroundImageUrl : allBeatmaps[0].backgroundImageUrl})`,
  };

  const currentLeaderboard = (hoveredSong && allScores[hoveredSong.id]) || [];

  return (
    <div className="song-selection-screen" style={backgroundStyle}>

      <div className="selection-overlay" />
      

      <div className="leaderboard-container">
        <h2>Ranking Global</h2>
        {currentLeaderboard.length > 0 ? (
          <ol>
            {currentLeaderboard.map((scoreEntry, index) => (
              <li key={index}>
                <span className="rank-position">#{index + 1}</span>
                <span className="rank-name">{scoreEntry.name}</span>
                <span className="rank-score">{scoreEntry.score.toLocaleString()}</span>
              </li>
            ))}
          </ol>
        ) : (
          <p>Nenhuma pontuação registrada para esta música.</p>
        )}
      </div>


      <div className="song-list">
        {allBeatmaps.map((beatmap) => (
          <div 
            key={beatmap.id} 
            className="song-item"
            onClick={() => onSongSelect(beatmap)}
            onMouseEnter={() => setHoveredSong(beatmap)}
          >
            <div className="song-title">{beatmap.title}</div>
            <div className="song-artist">{beatmap.artist}</div>
          </div>
        ))}
      </div>
      
      <button className="back-button" onClick={() => onNavigate('menu')}>‹</button>
    </div>
  );
}