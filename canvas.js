// ── canvas.js ─────────────────────────────────────────────────
// Handles all drawing, tools, and canvas state

const canvas = document.getElementById('sketchCanvas');
const ctx    = canvas.getContext('2d');

let drawing   = false;
let lastX     = 0;
let lastY     = 0;
let tool      = 'pen';
let color     = '#f0f0f0';
let brushSize = 4;

// ── Resize ────────────────────────────────────────────────────
function resizeCanvas() {
  const temp = document.createElement('canvas');
  temp.width  = canvas.width;
  temp.height = canvas.height;
  temp.getContext('2d').drawImage(canvas, 0, 0);

  canvas.width  = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;

  ctx.drawImage(temp, 0, 0);
}

window.addEventListener('load',   resizeCanvas);
window.addEventListener('resize', resizeCanvas);

// ── Coordinates ───────────────────────────────────────────────
function getPos(e) {
  const rect = canvas.getBoundingClientRect();
  const src  = e.touches ? e.touches[0] : e;
  return {
    x: src.clientX - rect.left,
    y: src.clientY - rect.top,
  };
}

// ── Draw actions ──────────────────────────────────────────────
function startDraw(e) {
  drawing = true;
  const p = getPos(e);
  lastX = p.x;
  lastY = p.y;
}

function draw(e) {
  if (!drawing) return;
  const p = getPos(e);

  if (tool === 'eraser') {
    ctx.clearRect(p.x - brushSize, p.y - brushSize, brushSize * 2, brushSize * 2);
  } else {
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(p.x, p.y);
    ctx.strokeStyle = color;
    ctx.lineWidth   = brushSize;
    ctx.lineCap     = 'round';
    ctx.lineJoin    = 'round';
    ctx.stroke();
  }

  lastX = p.x;
  lastY = p.y;
}

function stopDraw() {
  drawing = false;
}

// ── Mouse events ──────────────────────────────────────────────
canvas.addEventListener('mousedown',  startDraw);
canvas.addEventListener('mousemove',  draw);
canvas.addEventListener('mouseup',    stopDraw);
canvas.addEventListener('mouseleave', stopDraw);

// ── Touch events ──────────────────────────────────────────────
canvas.addEventListener('touchstart', e => { e.preventDefault(); startDraw(e); }, { passive: false });
canvas.addEventListener('touchmove',  e => { e.preventDefault(); draw(e); },      { passive: false });
canvas.addEventListener('touchend',   stopDraw);

// ── Tool setters (called from app.js) ─────────────────────────
function setTool(t) {
  tool = t;
  canvas.style.cursor = t === 'eraser' ? 'cell' : 'crosshair';
}

function setColor(c) {
  color = c;
  setTool('pen');
}

function setBrushSize(size) {
  brushSize = size;
}

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// ── Export canvas as PNG Blob ─────────────────────────────────
function getCanvasBlob() {
  return new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
}
