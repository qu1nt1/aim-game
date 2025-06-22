const SCORE_KEY = 'meuJogoDeRitmoScores';
export const getScores = () => {
  try {
    const scoresJSON = localStorage.getItem(SCORE_KEY);
    return scoresJSON ? JSON.parse(scoresJSON) : {};
  } catch (error) {
    console.error("Erro ao ler os scores:", error);
    return {};
  }
};

// salvar um novo score
export const saveScore = (beatmapId, playerName, score, maxCombo) => {
  if (!playerName.trim()) {
    playerName = "Anônimo"; 
  }

  const allScores = getScores();

  // lista de scores para mapa, cria uma nova se não existir
  const beatmapScores = allScores[beatmapId] || [];

  // adiciona score
  beatmapScores.push({
    name: playerName,
    score: score,
    maxCombo: maxCombo
  });

  beatmapScores.sort((a, b) => b.score - a.score);

  // apenas os top 15 scores
  allScores[beatmapId] = beatmapScores.slice(0, 15);

  try {
    localStorage.setItem(SCORE_KEY, JSON.stringify(allScores));
  } catch (error) {
    console.error("Erro ao salvar o score:", error);
  }
};