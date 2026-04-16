const canvas = document.getElementById('traceCanvas');
const ctx = canvas.getContext('2d');
const modeSelect = document.getElementById('mode');
const practiceInput = document.getElementById('practiceText');
const loadLettersBtn = document.getElementById('loadLetters');
const loadSentenceBtn = document.getElementById('loadSentence');
const clearCanvasBtn = document.getElementById('clearCanvas');
const quoteText = document.getElementById('quoteText');
const newQuoteBtn = document.getElementById('newQuote');
const markGoalBtn = document.getElementById('markGoal');
const resetGoalsBtn = document.getElementById('resetGoals');
const progressFill = document.getElementById('progressFill');
const progressLabel = document.getElementById('progressLabel');
const progressBar = document.querySelector('.progress-bar');
const goalBadge = document.getElementById('goalBadge');
const streakBadge = document.getElementById('streakBadge');

const goalTarget = 5;
let completedGoals = 0;
let sessionStreak = 0;

const quotes = [
  '"Messy pages are proof you are learning."',
  '"Great penmanship starts with one careful stroke."',
  '"Your handwriting is your brain\'s dance on paper."',
  '"Even superheroes practice their signatures."',
  '"Tiny improvements make beautiful letters."',
  '"Your cursive can be a rollercoaster of elegance!"',
];

function getGuideFont(mode) {
  if (mode === 'cursive') {
    return '52px "Brush Script MT", "Segoe Script", cursive';
  }
  return '700 50px "Trebuchet MS", sans-serif';
}

function drawGuideText() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.font = getGuideFont(modeSelect.value);
  ctx.fillStyle = '#9aa8e8';
  ctx.textBaseline = 'middle';
  ctx.globalAlpha = 0.55;

  const text = practiceInput.value.trim() || 'Practice makes progress';
  const wrappedLines = wrapLines(text, 20);

  wrappedLines.slice(0, 3).forEach((line, index) => {
    const y = 70 + index * 120;
    ctx.fillText(line, 40, y);
  });

  ctx.restore();
}

function wrapLines(text, maxLength) {
  const words = text.split(' ');
  const lines = [];
  let current = '';

  words.forEach((word) => {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > maxLength && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  });

  if (current) lines.push(current);
  return lines;
}

let drawing = false;
let pointerId = null;

function getPointFromEvent(event) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  return {
    x: (event.clientX - rect.left) * scaleX,
    y: (event.clientY - rect.top) * scaleY,
  };
}

function startDrawing(event) {
  drawing = true;
  pointerId = event.pointerId;
  canvas.setPointerCapture(pointerId);
  const { x, y } = getPointFromEvent(event);
  ctx.beginPath();
  ctx.moveTo(x, y);
}

function drawStroke(event) {
  if (!drawing || event.pointerId !== pointerId) return;
  const { x, y } = getPointFromEvent(event);
  ctx.strokeStyle = '#2b3050';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineTo(x, y);
  ctx.stroke();
}

function endDrawing(event) {
  if (event.pointerId !== pointerId) return;
  drawing = false;
  canvas.releasePointerCapture(pointerId);
  pointerId = null;
}

function clearTracing() {
  drawGuideText();
}

function randomQuote() {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  quoteText.textContent = quotes[randomIndex];
}

function updateProgress() {
  const pct = Math.min((completedGoals / goalTarget) * 100, 100);
  progressFill.style.width = `${pct}%`;
  progressBar.setAttribute('aria-valuenow', String(Math.round(pct)));
  progressLabel.textContent = `${completedGoals} / ${goalTarget} goals`;
  goalBadge.textContent = `🎯 ${completedGoals} goals done`;
  streakBadge.textContent = `🔥 Session streak: ${sessionStreak}`;
}

modeSelect.addEventListener('change', drawGuideText);
practiceInput.addEventListener('input', drawGuideText);
loadLettersBtn.addEventListener('click', () => {
  practiceInput.value = modeSelect.value === 'cursive' ? 'abc def ghi jkl mnop' : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  drawGuideText();
});
loadSentenceBtn.addEventListener('click', () => {
  practiceInput.value = 'I can improve one line at a time.';
  drawGuideText();
});
clearCanvasBtn.addEventListener('click', clearTracing);
newQuoteBtn.addEventListener('click', randomQuote);
markGoalBtn.addEventListener('click', () => {
  completedGoals = Math.min(completedGoals + 1, goalTarget);
  sessionStreak += 1;
  updateProgress();
});
resetGoalsBtn.addEventListener('click', () => {
  completedGoals = 0;
  sessionStreak = 0;
  updateProgress();
});

canvas.addEventListener('pointerdown', startDrawing);
canvas.addEventListener('pointermove', drawStroke);
canvas.addEventListener('pointerup', endDrawing);
canvas.addEventListener('pointercancel', endDrawing);
canvas.addEventListener('pointerleave', (event) => {
  if (drawing) endDrawing(event);
});

drawGuideText();
updateProgress();
randomQuote();
