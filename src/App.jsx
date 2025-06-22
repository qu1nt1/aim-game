import React, { useState } from 'react';
import Menu from './components/Menu';
import Tutorial from './components/Tutorial';
import Controls from './components/Controls';
import SongSelection from './components/SongSelection';
import GameCanvas from './components/GameCanvas';
import ResultsScreen from './components/ResultsScreen'; 
import PracticeCanvas from './components/PracticeCanvas';
import './App.css';

export default function App() {
  const [screen, setScreen] = useState('menu');
  const [selectedBeatmap, setSelectedBeatmap] = useState(null);
  const [lastPlayStats, setLastPlayStats] = useState(null);

  const navigateTo = (screenName) => {
    setScreen(screenName);
  };

  const handleSongSelect = (beatmapData) => {
    setSelectedBeatmap(beatmapData);
    setScreen('gameplay');
  };

  const handleGameEnd = (stats) => {
    setLastPlayStats(stats); 
    setScreen('results');  
  };

  const renderScreen = () => {
    switch (screen) {
      case 'song-selection':
        return <SongSelection onSongSelect={handleSongSelect} onNavigate={navigateTo} />;
      
      case 'gameplay':
        if (!selectedBeatmap) return <Menu onNavigate={navigateTo} />;
        return <GameCanvas beatmapData={selectedBeatmap} onNavigate={navigateTo} onGameEnd={handleGameEnd} />;
      
      case 'results':
        return <ResultsScreen stats={lastPlayStats} beatmap={selectedBeatmap} onNavigate={navigateTo} />;
      
      case 'tutorial':
        return <Tutorial onNavigate={navigateTo} />;
      
      case 'controls':
        return <Controls onNavigate={navigateTo} />;
      
      case 'practice':
              return <PracticeCanvas onNavigate={navigateTo} />;

      case 'menu':
      default:
        return <Menu onNavigate={navigateTo} />;
    }
  };

  return ( <div className="App">{renderScreen()}</div> );
}