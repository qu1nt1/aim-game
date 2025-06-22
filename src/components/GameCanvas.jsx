import React from 'react';
import Sketch from 'react-p5';

const activeKeys = new Set();
let musicAudioElement = null;
let circles = [];
let score = 0, combo = 0, maxCombo = 0;
let activeMissEffects = [];
let hitSound, missSound, circleImg, missXImage;
let hits = 0;
let misses = 0;
let lastObjectTime = 0;
let mapTotalJudgments = 0; 
let isGameOver = false;

export default function GameCanvas({ beatmapData, onNavigate, onGameEnd }) {
  
  const FADE_IN_DURATION = 0.3;
  const MISS_X_DURATION = 0.5;
  const SCORE_MULTIPLIER = 300;
  
  const cleanup = () => {
    if (musicAudioElement) {
        musicAudioElement.pause();
        musicAudioElement.src = '';
        musicAudioElement = null;
    }
    activeKeys.clear();
  };

  const preload = (p) => {
    circleImg = p.loadImage('/circle.png');
    missXImage = p.loadImage('/miss_x.png');
    try {
        hitSound = new Audio('/hit-sound.mp3');
        missSound = new Audio('/miss.mp3');
    } catch(e) { console.error("Não foi possível carregar os efeitos sonoros:", e); }
  };

  const setup = (p, canvasParentRef) => {
    p.createCanvas(1905, 1073).parent(canvasParentRef);
    p.select('canvas').style('cursor', `url(/cursor.png) 64 64, auto`);
    
    // reseta tudo no inicio de cada partida
    score = 0; combo = 0; maxCombo = 0; circles = []; activeMissEffects = [];
    activeKeys.clear();
    lastObjectTime = 0; mapTotalJudgments = 0; isGameOver = false;
    hits = 0; misses = 0;

    const size = beatmapData.circleSize || 90;
    const ar = beatmapData.approachDuration || 1.0;

    let currentBeatmap = beatmapData.beatmap;
    for (let obj of currentBeatmap) {
      if (obj.type === 'slider') {
        circles.push(new Slider(p, obj.time, obj.x, obj.y, obj.path, obj.duration, size, ar));
        mapTotalJudgments += 2; 
      } else {
        circles.push(new HitCircle(p, obj.time, obj.x, obj.y, size, ar));
        mapTotalJudgments += 1;
      }
      const endTime = obj.duration ? obj.time + obj.duration : obj.time;
      if (endTime > lastObjectTime) { lastObjectTime = endTime; }
    }

    if (!musicAudioElement) {
      musicAudioElement = new Audio(beatmapData.songUrl);
      musicAudioElement.play().catch(e => console.error("Erro ao tocar a música:", e));
    }
    
    p.myCustomProps = { lastObjectTime, mapTotalJudgments, isGameOver };
  };

  const draw = (p) => {
    p.background(30);
    let musicTime = musicAudioElement ? musicAudioElement.currentTime : 0;
    
    let { lastObjectTime, mapTotalJudgments, isGameOver: localIsGameOver } = p.myCustomProps;

    if (!localIsGameOver && musicTime > lastObjectTime + 1.5 && lastObjectTime > 0) {
      p.myCustomProps.isGameOver = true;
      const grade = calcularNota(hits, mapTotalJudgments);
      cleanup();
      onGameEnd({ score, grade, hits, misses, totalJudgments: mapTotalJudgments, playerMaxCombo: maxCombo });
    }

    for (let c of circles) {
      c.update(musicTime);
      c.show(musicTime);
      if (c instanceof HitCircle && !c.hit && !c.missed) {
        if (musicTime > c.appearTime + c.missWindow) {
          c.missed = true;
          if (combo > 5 && missSound) missSound.cloneNode().play();
          triggerMissEffect(p, c.x, c.y);
          combo = 0;
          misses++;
        }
      }
    }
    drawActiveMissEffects(p);
    drawHUD(p);
  };
  
  const calcularNota = (totalHits, totalNotes) => {
    if (totalNotes === 0) return 'N/A';
    const precisao = totalHits / totalNotes;
    if (precisao === 1) return 'S';
    if (precisao >= 0.95) return 'A';
    if (precisao >= 0.85) return 'B';
    if (precisao >= 0.75) return 'C';
    return 'D';
  };

  function processHitAttempt(p, clickX, clickY, time) {
    for (let c of circles) {
      if (!c.hit && !c.missed && c.checkHit(clickX, clickY, time)) {
        if (c instanceof HitCircle) {
          if(hitSound) hitSound.cloneNode().play();
          combo++;
          hits++; //conta o acerto
          score += combo * SCORE_MULTIPLIER;
          if (combo > maxCombo) maxCombo = combo;
        }
        break;
      }
    }
  }

  const mousePressed = (p) => {
      if (musicAudioElement) {
          processHitAttempt(p, p.mouseX, p.mouseY, musicAudioElement.currentTime);
      }
  };
  const keyPressed = (p) => {
      const key = p.key.toLowerCase();

      if (key === 'z' || key === 'x') {
          if (!activeKeys.has(key)) {
              activeKeys.add(key);
              if (musicAudioElement) {
                  processHitAttempt(p, p.mouseX, p.mouseY, musicAudioElement.currentTime);
              }
          }
      }
  };

  const keyReleased = (p) => {
      const key = p.key.toLowerCase();

      if (key === 'z' || key === 'x') {
          activeKeys.delete(key);
      }

      if (p.key === 'Escape') {
          cleanup();
          onNavigate('menu');
      }
  };
    
  function triggerMissEffect(p, x, y) { 
      if (!missXImage) return;

      activeMissEffects.push({
          x: x,
          y: y,
          startTime: p.millis(),
          duration: MISS_X_DURATION * 1e3
      });
  }

  function drawActiveMissEffects(p) {
      if (!missXImage) return;

      let a = p.millis();
      for (let b = activeMissEffects.length - 1; b >= 0; b--) {
          let c = activeMissEffects[b];
          let d = a - c.startTime;

          if (d >= c.duration) {
              activeMissEffects.splice(b, 1);
          } else {
              p.push();
              p.imageMode(p.CENTER);
              let e = p.map(d, 0, c.duration, 255, 0);
              p.tint(255, 255, 255, e);
              p.image(missXImage, c.x, c.y, 200, 200);
              p.pop();
          }
      }
  }


  function drawHUD(p) {
      p.push();
      p.textAlign(p.RIGHT, p.TOP);
      p.textSize(32);
      p.fill(255);
      p.noStroke();
      
      let a = p.nf(score, 7); // number format score para 7 digitos
      p.text(a, p.width - 20, 20);

      p.textAlign(p.LEFT, p.BOTTOM);
      p.textSize(48);
      if (combo > 0) {
          p.text(combo + "x", 20, p.height - 20);
      }

      p.pop();
  }
  class HitCircle {
      constructor(p, appearTime, x, y, circleSize, approachDurationValue) {
          this.p = p;
          this.appearTime = appearTime;
          this.x = x;
          this.y = y;
          this.hit = false;
          this.missed = false;
          this.radius = circleSize;
          this.approachRadius = circleSize * 2.5;
          this.approachDuration = approachDurationValue;
          this.missWindow = 0.3;
      }

      update(musicTime) {
          if (this.hit || this.missed || musicTime < this.appearTime - this.approachDuration) return;
          
          let timeLeft = this.appearTime - musicTime;
          this.currentApproachRadius = this.p.map(timeLeft, this.approachDuration, 0, this.approachRadius, this.radius);
          this.currentApproachRadius = this.p.constrain(this.currentApproachRadius, this.radius, this.approachRadius);
      }

      show(musicTime) {
          if (this.hit || this.missed) return;
          
          let visualStartTime = this.appearTime - this.approachDuration;
          if (musicTime < visualStartTime || musicTime > this.appearTime + 0.5) return;

          let timeSinceVisualStart = musicTime - visualStartTime;
          let currentOverallAlpha = this.p.constrain(this.p.map(timeSinceVisualStart, 0, FADE_IN_DURATION, 0, 255), 0, 255);
          
          this.p.imageMode(this.p.CENTER);
          
          let approachCircleAlpha = this.p.map(currentOverallAlpha, 0, 255, 0, 150);
          this.p.tint(0, 200, 255, approachCircleAlpha);
          this.p.image(circleImg, this.x, this.y, this.currentApproachRadius * 2, this.currentApproachRadius * 2);
          
          this.p.tint(255, 255, 255, currentOverallAlpha);
          this.p.image(circleImg, this.x, this.y, this.radius * 2, this.radius * 2);
          
          this.p.noTint();
      }

      checkHit(mx, my, musicTime) {
          if (this.hit || this.missed) return false;
          
          let d = this.p.dist(mx, my, this.x, this.y);
          let timeDiff = this.p.abs(musicTime - this.appearTime);
          
          if (d < this.radius && timeDiff < this.missWindow) {
              this.hit = true;
              return true;
          }
          
          return false;
      }
  }

  class Slider {
    constructor(p, appearTime, x, y, path, duration, circleSize, approachDurationValue) {
      this.p = p; this.appearTime = appearTime; this.x = x; this.y = y; this.path = path; this.duration = duration;
      this.hit = false; this.missed = false; this.radius = circleSize; this.approachRadius = circleSize * 2.5;
      this.approachDuration = approachDurationValue; this.holding = false;
    }
    update(musicTime) {
      // circulo se aproximando
      if (!this.hit && !this.missed) {
        if (musicTime < this.appearTime && musicTime >= (this.appearTime - this.approachDuration)) {
          let timeLeft = this.appearTime - musicTime;
          this.currentApproachRadius = this.p.map(timeLeft, this.approachDuration, 0, this.approachRadius, this.radius);
          this.currentApproachRadius = this.p.constrain(this.currentApproachRadius, this.radius, this.approachRadius);
        } else if (musicTime >= this.appearTime) {
          this.currentApproachRadius = this.radius;
        }
      }

      // slider já foi finalizado
      if (this.hit || this.missed) return;

      //  nao esta segurando o slider
      if (!this.holding) {
        // tempo do slider já passou
        if (musicTime > (this.appearTime + this.duration + 0.1)) {
          this.missed = true;
          if (combo > 5 && missSound) missSound.cloneNode().play();
          triggerMissEffect(this.p, this.x, this.y);
          combo = 0;
          misses += 2;
        }
        return; 
      }

      if (musicTime >= (this.appearTime + this.duration)) {
        if (!this.hit) { 
          this.hit = true;
          combo++;
          score += combo * SCORE_MULTIPLIER;
          hits++;
          if (combo > maxCombo) maxCombo = combo;
        }
        return;
      }
      
 
      const end = this.path[0];
      const t = this.p.map(musicTime, this.appearTime, this.appearTime + this.duration, 0, 1, true);
      const ballX = this.p.lerp(this.x, end.x, t);
      const ballY = this.p.lerp(this.y, end.y, t);
      const distance = this.p.dist(this.p.mouseX, this.p.mouseY, ballX, ballY);
      const followRadius = this.radius * 2.2;
      
      const isButtonReleased = !this.p.mouseIsPressed && activeKeys.size === 0;
      const isOffTrack = distance > followRadius;

      // verifica quebra do slider
      if (isButtonReleased || isOffTrack) {

        const gracePeriod = this.duration * 0.15; // 15% de tolerancia no fim do slider
        const sliderEndTime = this.appearTime + this.duration;

        if (musicTime >= sliderEndTime - gracePeriod) {
          if (!this.hit) {
            this.hit = true;
            combo++;
            score += combo * SCORE_MULTIPLIER;
            hits++; 
            if (combo > maxCombo) maxCombo = combo;
          }
        } else {
          this.holding = false;
          this.missed = true;
          if (combo > 5 && missSound) missSound.cloneNode().play();
          triggerMissEffect(this.p, ballX, ballY);
          combo = 0;
          misses += 2;
        }
      }
    }
    show(musicTime) {
        if (this.hit || this.missed) return;

        let visualStartTime = this.appearTime - this.approachDuration;
        if (musicTime < visualStartTime || musicTime > this.appearTime + this.duration + 0.2) return;

        let timeSinceVisualStart = musicTime - visualStartTime;
        let currentOverallAlpha = this.p.constrain(this.p.map(timeSinceVisualStart, 0, FADE_IN_DURATION, 0, 255), 0, 255);

        let end = this.path[0];

        // Desenha a linha do slider (borda e preenchimento)
        this.p.push();
        this.p.strokeCap(this.p.ROUND);
        const borderThickness = this.radius * 2;
        this.p.strokeWeight(borderThickness);
        this.p.stroke(255, 255, 255, currentOverallAlpha * 0.8);
        this.p.line(this.x, this.y, end.x, end.y);

        const fillThickness = borderThickness - 10;
        this.p.strokeWeight(fillThickness);
        this.p.stroke(50, 50, 50, currentOverallAlpha * 0.7);
        this.p.line(this.x, this.y, end.x, end.y);
        this.p.pop();

        // Desenha os círculos (aproximação, início e fim)
        this.p.imageMode(this.p.CENTER);
        let approachCircleAlpha = this.p.map(currentOverallAlpha, 0, 255, 0, 150);
        this.p.tint(0, 200, 255, approachCircleAlpha);
        this.p.image(circleImg, this.x, this.y, this.currentApproachRadius * 2, this.currentApproachRadius * 2);

        this.p.tint(255, 255, 255, currentOverallAlpha);
        this.p.image(circleImg, this.x, this.y, this.radius * 2, this.radius * 2);
        this.p.image(circleImg, end.x, end.y, this.radius * 2, this.radius * 2);

        // Desenha a bola que se move ao longo do slider
        if (musicTime >= this.appearTime && musicTime <= this.appearTime + this.duration) {
            let t = this.p.map(musicTime, this.appearTime, this.appearTime + this.duration, 0, 1, true);
            let x = this.p.lerp(this.x, end.x, t);
            let y = this.p.lerp(this.y, end.y, t);

            let ballDiameter = this.radius * 2;
            if (this.holding) {
                ballDiameter = this.radius * 2 * 1.2;
            }

            this.p.tint(255, 255, 255, currentOverallAlpha);
            this.p.image(circleImg, x, y, ballDiameter, ballDiameter);
        }

        this.p.noTint();
    }
    checkHit(mx, my, musicTime) {
      if (this.hit || this.missed || this.holding) return false;
      let d = this.p.dist(mx, my, this.x, this.y);
      let timeDiff = this.p.abs(musicTime - this.appearTime);
      if (d < this.radius && timeDiff < 0.3) {
        this.holding = true;
        if (hitSound) hitSound.cloneNode().play();
        combo++;
        hits++;
        score += combo * SCORE_MULTIPLIER;
        if (combo > maxCombo) maxCombo = combo;
        return true;
      }
      return false;
    }
  }

  return (
    <div className="game-container">
      <Sketch
        preload={preload}
        setup={setup}
        draw={draw}
        mousePressed={mousePressed}
        keyPressed={keyPressed}
        keyReleased={keyReleased}
      />
    </div>
  );
}