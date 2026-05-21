// ── app.js ────────────────────────────────────────────────────
// Wires up UI controls to canvas.js and api.js

// ── Tool buttons ──────────────────────────────────────────────
document.getElementById('penBtn').addEventListener('click', () => {
  setTool('pen');
  document.getElementById('penBtn').classList.add('active');
  document.getElementById('eraserBtn').classList.remove('active');
});

document.getElementById('eraserBtn').addEventListener('click', () => {
  setTool('eraser');
  document.getElementById('eraserBtn').classList.add('active');
  document.getElementById('penBtn').classList.remove('active');
});

// ── Brush size ────────────────────────────────────────────────
document.getElementById('sizeSlider').addEventListener('input', e => {
  setBrushSize(parseInt(e.target.value));
});

// ── Color swatches ────────────────────────────────────────────
document.querySelectorAll('.color-swatch').forEach(swatch => {
  swatch.addEventListener('click', () => {
    document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
    swatch.classList.add('active');
    setColor(swatch.dataset.color);

    // Switch back to pen when picking a color
    document.getElementById('penBtn').classList.add('active');
    document.getElementById('eraserBtn').classList.remove('active');
  });
});

// ── Clear button ──────────────────────────────────────────────
document.getElementById('clearBtn').addEventListener('click', () => {
  clearCanvas();
  document.getElementById('resultImg').style.display = 'none';
  document.getElementById('placeholder').style.display = 'block';
  document.getElementById('errorMsg').style.display = 'none';
});

// ── Generate button ───────────────────────────────────────────
document.getElementById('generateBtn').addEventListener('click', generate);

// Also trigger on Enter in prompt field
document.getElementById('promptInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') generate();
});

async function generate() {
  const apiKey = document.getElementById('apiKeyInput').value.trim();
  const prompt = document.getElementById('promptInput').value.trim() || 'realistic photo, highly detailed';
  const errEl  = document.getElementById('errorMsg');

  errEl.style.display = 'none';

  if (!apiKey) {
    showError('Please enter your fal.ai API key.');
    return;
  }

  // Show loading state
  setLoading(true);

  try {
    const blob      = await getCanvasBlob();
    const resultUrl = await generateFromSketch({ blob, prompt, apiKey });

    const img = document.getElementById('resultImg');
    img.src   = resultUrl;
    img.style.display = 'block';
    document.getElementById('placeholder').style.display = 'none';

  } catch (err) {
    showError(err.message);
  } finally {
    setLoading(false);
  }
}

// ── Helpers ───────────────────────────────────────────────────
function setLoading(active) {
  document.getElementById('loadingOverlay').classList.toggle('active', active);
  document.getElementById('generateBtn').disabled = active;
  if (active) {
    document.getElementById('placeholder').style.display = 'none';
    document.getElementById('resultImg').style.display   = 'none';
  }
}

function showError(msg) {
  const errEl = document.getElementById('errorMsg');
  errEl.textContent  = `⚠ ${msg}`;
  errEl.style.display = 'block';
  document.getElementById('placeholder').style.display = 'block';
}
