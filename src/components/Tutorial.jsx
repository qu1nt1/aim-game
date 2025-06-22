import React, { useState } from 'react';

export default function Tutorial({ onNavigate }) {
  const [isScoreOpen, setIsScoreOpen] = useState(false);
  const [isGradesOpen, setIsGradesOpen] = useState(false);
  const styles = `
    .collapsible {
      background-color:rgba(97, 97, 97, 0.25);
      color: white;
      cursor: pointer;
      padding: 18px;
      width: 100%;
      border: none;
      text-align: left;
      outline: none;
      font-size: 18px;
      border-radius: 5px;
      margin-top: 10px;
    }

    .collapsible:hover {
      background-color:rgba(143, 142, 142, 0.2);
    }

    .collapsible-content {
      padding: 0 18px;
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.2s ease-out;
      background-color:rgba(51, 49, 49, 0.25);
      border-radius: 0 0 5px 5px;
    }

    .collapsible-content p, .collapsible-content ul {
        margin-top: 10px;
        margin-bottom: 10px;
    }

    .collapsible-content ul {
        list-style-position: inside;
        padding-left: 5px;
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className="tutorial-screen menu-screen with-background">
        <button className="back-button" onClick={() => onNavigate('menu')}>‹</button>
        <div className="tutorial-content">
          <section>
            <h2>Objetivo</h2>
            <p>Mire e acerte os alvos no ritmo da música. Cada clique no tempo certo aumenta seu combo e sua pontuação. Siga os sliders com o cursor e não erre o alvo. Mostre que você tem a melhor mira!</p>
            <section>
            <video src="/tutorial-game.mp4" controls width="640" height="360"></video>
          </section>

            <button 
              className="collapsible" 
              onClick={() => setIsScoreOpen(!isScoreOpen)}
            >
              Como funciona a pontuação?
            </button>
            <div 
              className="collapsible-content" 
              style={{ maxHeight: isScoreOpen ? '200px' : '0' }}
            >
              <p>Sua pontuação é baseada na sua precisão e no seu combo atual. Cada acerto vale 300 pontos, que são multiplicados pelo seu combo. Mantenha uma sequência de acertos para maximizar seus pontos!</p>
            </div>

            <button 
              className="collapsible" 
              onClick={() => setIsGradesOpen(!isGradesOpen)}
            >
              Como funciona sua nota?
            </button>
            <div 
              className="collapsible-content" 
              style={{ maxHeight: isGradesOpen ? '200px' : '0' }}
            >
              <p>Ao final da música, sua performance é avaliada com uma nota baseada na sua precisão:</p>
              <ul>
                <li>S: 100% de acertos</li>
                <li>A: 95% ou mais</li>
                <li>B: 85% ou mais</li>
                <li>C: 75% ou mais</li>
                <li>D: Menos de 75%</li>
              </ul>
            </div>

          </section>
          
          <div className='center-div'>
            <p>Equipe: João Pedro de Souza Quintiliano da Silva/Adrian Antônio de Souza Gomes</p> 
          </div>
        </div>
      </div>
    </>
  );
}
