// Referencias al DOM
const btnRed = document.getElementById('btn-red');
const btnBlue = document.getElementById('btn-blue');
const btnReset = document.getElementById('btn-reset');

const choiceSection = document.getElementById('choice-section');
const resultContainer = document.getElementById('result-container');
const resultMessage = document.getElementById('result-message');
const resultDescription = document.getElementById('result-description');
const resultIcon = document.getElementById('result-icon');
const gameContainer = document.querySelector('.game-container');

const winsCountEl = document.getElementById('wins-count');
const lossesCountEl = document.getElementById('losses-count');
const confettiCanvas = document.getElementById('confetti-canvas');

// Estado del juego
let wins = 0;
let losses = 0;
let isAnimating = false;

// Frases aleatorias para darle más personalidad
const winPhrases = [
  '¡El destino te sonríe hoy!',
  '¡Una decisión impecable y afortunada!',
  '¡La gloria es tuya!',
  '¡Acertaste de lleno con tu intuición!'
];

const losePhrases = [
  'La suerte no estuvo contigo esta vez...',
  'El destino ha sido cruel, pero hay revancha.',
  '¡Caíste en la trampa! Vuelve a intentarlo.',
  'Un tropiezo no es el final del camino.'
];

// Audio opcional sintetizado mediante Web Audio API (sin archivos externos)
let audioCtx = null;
function playSound(type) {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    const now = audioCtx.currentTime;

    if (type === 'win') {
      // Tono triunfal ascendente
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(392, now); // G4
      osc.frequency.exponentialRampToValueAtTime(784, now + 0.18); // G5
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === 'lose') {
      // Tono grave descendente
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now); // A3
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.25); // A2
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === 'click') {
      // Click sutil
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.08);
    }
  } catch (e) {
    // Si el navegador bloquea audio, el juego continúa sin problemas
  }
}

// Generador de confeti en Vanilla JS
let confettiParticles = [];
let confettiAnimationId = null;

function resizeCanvas() {
  if (confettiCanvas) {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
  }
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function triggerConfetti() {
  const colors = ['#ff3366', '#ff6b4a', '#0070f3', '#00d4ff', '#10b981', '#fbbf24', '#a855f7'];
  confettiParticles = [];

  for (let i = 0; i < 90; i++) {
    confettiParticles.push({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      vx: (Math.random() - 0.5) * 16,
      vy: (Math.random() - 0.7) * 18,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      vRot: (Math.random() - 0.5) * 10,
      alpha: 1,
      gravity: 0.35
    });
  }

  if (confettiAnimationId) cancelAnimationFrame(confettiAnimationId);
  renderConfetti();
}

function renderConfetti() {
  const ctx = confettiCanvas.getContext('2d');
  ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

  let activeParticles = 0;

  confettiParticles.forEach((p) => {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += p.gravity;
    p.rotation += p.vRot;
    p.alpha -= 0.008;

    if (p.alpha > 0) {
      activeParticles++;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7);
      ctx.restore();
    }
  });

  if (activeParticles > 0) {
    confettiAnimationId = requestAnimationFrame(renderConfetti);
  } else {
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  }
}

// Función principal de elección
function handleChoice(chosenColor) {
  if (isAnimating) return;
  isAnimating = true;

  // Feedback táctil/auditivo
  playSound('click');

  // Animación de salida de los botones
  choiceSection.classList.add('fade-out');

  setTimeout(() => {
    choiceSection.style.display = 'none';

    // Determinar resultado aleatorio (50% probabilidad)
    const isWinner = Math.random() < 0.5;

    // Actualizar clases de resultado
    resultMessage.classList.remove('win', 'lose');
    resultIcon.classList.remove('win', 'lose');
    gameContainer.classList.remove('shake');

    if (isWinner) {
      wins++;
      winsCountEl.textContent = wins;
      resultMessage.textContent = 'Has ganado';
      resultMessage.classList.add('win');
      resultIcon.textContent = '🏆';
      resultIcon.classList.add('win');
      resultDescription.textContent = winPhrases[Math.floor(Math.random() * winPhrases.length)];

      playSound('win');
      triggerConfetti();
    } else {
      losses++;
      lossesCountEl.textContent = losses;
      resultMessage.textContent = 'Has perdido';
      resultMessage.classList.add('lose');
      resultIcon.textContent = '💀';
      resultIcon.classList.add('lose');
      resultDescription.textContent = losePhrases[Math.floor(Math.random() * losePhrases.length)];

      playSound('lose');

      // Animación de sacudida
      gameContainer.classList.add('shake');
      setTimeout(() => gameContainer.classList.remove('shake'), 600);
    }

    // Mostrar sección de resultados
    resultContainer.classList.remove('hidden');
    isAnimating = false;
  }, 250);
}

// Función para reiniciar y volver a jugar
function resetGame() {
  if (isAnimating) return;
  isAnimating = true;

  playSound('click');

  // Ocultar sección de resultado
  resultContainer.classList.add('hidden');

  // Restaurar sección de opciones
  choiceSection.style.display = 'block';
  setTimeout(() => {
    choiceSection.classList.remove('fade-out');
    isAnimating = false;
  }, 50);
}

// Event Listeners
btnRed.addEventListener('click', () => handleChoice('red'));
btnBlue.addEventListener('click', () => handleChoice('blue'));
btnReset.addEventListener('click', resetGame);
