import React from 'react';

export default function Controls({ onNavigate }) {
  return (
    <div className="controls-screen menu-screen with-background">
      <button className="back-button" onClick={() => onNavigate('menu')}>‹</button>
      <div className="controls-content">
        <h1>Controles do Jogo</h1>

        <section>
          <h2>Jogabilidade</h2>
          <div className="control-item">
            <span className="control-key">Clique Esquerdo do Mouse</span>
            <span className="control-description">Interagir com os círculos de clique e iniciar/seguir os sliders.</span>
          </div>
          <div className="control-item">
            <span className="control-key">Tecla Z</span>
            <span className="control-description">Função alternativa para interagir com os círculos de clique e iniciar/seguir os sliders.</span>
          </div>
          <div className="control-item">
            <span className="control-key">Tecla X</span>
            <span className="control-description">Função alternativa para interagir com os círculos de clique e iniciar/seguir os sliders.</span>
          </div>
        </section>

        <section>
          <h2>Durante a Música</h2>
          <div className="control-item">
            <span className="control-key">Clique no Círculo</span>
            <span className="control-description">Clique precisamente quando o círculo de aproximação se sobrepõe ao círculo principal para ganhar pontos.</span>
          </div>
          <div className="control-item">
            <span className="control-key">Clique e Arraste (Sliders)</span>
            <span className="control-description">Mantenha o botão/tecla pressionada e siga a bolinha pelo caminho do slider até o final.</span>
          </div>
        </section>

        <section>
          <h2>Outros</h2>
          <div className="control-item">
            <span className="control-key">Tecla ESC</span>
            <span className="control-description">Durante uma música ou no modo prática, pressionar ESC retorna ao menu principal.</span>
          </div>
        </section>
      </div>
    </div>
  );
}