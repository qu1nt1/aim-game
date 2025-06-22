import React from 'react';
import Sketch from 'react-p5';


const activeKeys = new Set();
let circles = [];
let score = 0;
let combo = 0;
let circleImg, missXImage, hitSound, missSound;
let lastSpawnTime = 0;
let spawnInterval = 2000;
let messageVisibleUntil = 0;
let activeMissEffects = [];

export default function PracticeCanvas({ onNavigate }) {
  

  const MIN_SPAWN_INTERVAL = 300;
  const INTERVAL_DECREMENT = 50;
  const MESSAGE_DURATION = 5000;
  const PLAY_AREA_X1 = 384;
  const PLAY_AREA_Y1 = 126;
  const PLAY_AREA_X2 = 1533;
  const PLAY_AREA_Y2 = 988;
  const FADE_IN_DURATION = 0.3;
  const MISS_X_DURATION = 0.5;
  const SCORE_MULTIPLIER = 300;
  
  const cleanup = () => {
    circles = []; score = 0; combo = 0;
    activeKeys.clear();
  };

  const preload = (p) => {
    circleImg = p.loadImage('/circle.png');
    missXImage = p.loadImage('/miss_x.png');
    try {
      hitSound = new Audio('/hit-sound.mp3');
      missSound = new Audio('/miss.mp3');
    } catch(e) {
      console.error("Erro ao carregar efeitos sonoros:", e);
    }
  };

  const setup = (p, canvasParentRef) => {
    p.createCanvas(1905, 1073).parent(canvasParentRef);
    p.select('canvas').style('cursor', `url(/cursor.png) 64 64, auto`);
    
    score = 0; combo = 0; circles = []; activeMissEffects = [];
    activeKeys.clear();
    lastSpawnTime = 0;
    spawnInterval = 2000;
    messageVisibleUntil = p.millis() + MESSAGE_DURATION;
  };

  const draw = (p) => {
    p.background(30);
    const currentTime = p.millis();

    if (currentTime > lastSpawnTime + spawnInterval) {
      const x = p.random(PLAY_AREA_X1, PLAY_AREA_X2);
      const y = p.random(PLAY_AREA_Y1, PLAY_AREA_Y2);
      circles.push(new PracticeCircle(p, x, y, 90, 1.0)); 
      lastSpawnTime = currentTime;
    }

    for (let i = circles.length - 1; i >= 0; i--) {
      const c = circles[i];
      c.update();
      c.show();
      if (c.isMissed()) {
        if (combo > 5 && missSound) missSound.cloneNode().play();
        triggerMissEffect(p, c.x, c.y);
        combo = 0;
        circles.splice(i, 1);
      }
    }
    
    drawActiveMissEffects(p);
    drawHUD(p);
  };
  
  const processPracticeHit = (p) => {
    for (let i = circles.length - 1; i >= 0; i--) {
      if (circles[i].checkHit(p.mouseX, p.mouseY)) {
        if (hitSound) hitSound.cloneNode().play();
        combo++;
        score += combo * 300; 
        spawnInterval = Math.max(MIN_SPAWN_INTERVAL, spawnInterval - INTERVAL_DECREMENT);
        circles.splice(i, 1);
        return; 
      }
    }
  };

  const mousePressed = (p) => {
    processPracticeHit(p);
  };

  const keyPressed = (p) => {
    const key = p.key.toLowerCase();
    if (key === 'z' || key === 'x') {
      if (!activeKeys.has(key)) {
        activeKeys.add(key);
        processPracticeHit(p);
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

  function drawHUD(p) { 
    p.push();
    p.textAlign(p.RIGHT, p.TOP);
    p.textSize(32);
    p.fill(255);
    p.noStroke();
    let scoreString = p.nf(score, 7);
    p.text(scoreString, p.width - 20, 20);

    p.textAlign(p.LEFT, p.BOTTOM);
    p.textSize(48);
    if (combo > 0) {
      p.text(combo + "x", 20, p.height - 20);
    }

    if (p.millis() < messageVisibleUntil) {
      p.textAlign(p.CENTER, p.TOP);
      p.textSize(40);
      p.fill(255, 255, 255, p.map(p.millis(), messageVisibleUntil - 2000, messageVisibleUntil, 255, 0, true));
      p.text("PRATIQUE AQUI", p.width / 2, 20);
      p.textSize(18);
      p.text("Pressione ESC para sair", p.width / 2, 65);
    }
    p.pop();
  }

  function triggerMissEffect(p, x, y) {
    if (!missXImage) return;
    activeMissEffects.push({
      x, y,
      startTime: p.millis(),
      duration: MISS_X_DURATION * 1000,
    });
  }

  function drawActiveMissEffects(p) {
    if (!missXImage) return;
    let currentTime = p.millis();
    for (let i = activeMissEffects.length - 1; i >= 0; i--) {
      let effect = activeMissEffects[i];
      let elapsedTime = currentTime - effect.startTime;
      if (elapsedTime >= effect.duration) {
        activeMissEffects.splice(i, 1);
      } else {
        p.push();
        p.imageMode(p.CENTER);
        let alpha = p.map(elapsedTime, 0, effect.duration, 255, 0);
        p.tint(255, 255, 255, alpha);
        p.image(missXImage, effect.x, effect.y, 200, 200);
        p.pop();
      }
    }
  }

  class PracticeCircle {
    constructor(p, x, y, radius, approachDuration) {
      this.p = p; this.x = x; this.y = y; this.radius = radius;
      this.approachDuration = approachDuration * 1000;
      this.createdAt = p.millis();
      this.approachRadius = radius * 2.5;
      this.hit = false;
    }
    update() {
      let elapsedTime = this.p.millis() - this.createdAt;
      this.currentApproachRadius = this.p.map(elapsedTime, 0, this.approachDuration, this.approachRadius, this.radius);
      this.currentApproachRadius = this.p.constrain(this.currentApproachRadius, this.radius, this.approachRadius);
    }
    show() {
      this.p.imageMode(this.p.CENTER);
      this.p.tint(0, 200, 255, 150);
      this.p.image(circleImg, this.x, this.y, this.currentApproachRadius * 2, this.currentApproachRadius * 2);
      this.p.tint(255);
      this.p.image(circleImg, this.x, this.y, this.radius * 2, this.radius * 2);
      this.p.noTint();
    }
    checkHit(mx, my) {
      let d = this.p.dist(mx, my, this.x, this.y);
      if (d < this.radius) {
        this.hit = true;
        return true;
      }
      return false;
    }
    isMissed() {

      return !this.hit && (this.p.millis() > this.createdAt + this.approachDuration + 200);
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