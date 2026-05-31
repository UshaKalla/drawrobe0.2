// ── app.js ────────────────────────────────────────────────────

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
    document.getElementById('penBtn').classList.add('active');
    document.getElementById('eraserBtn').classList.remove('active');
  });
});

// ── Clear button ──────────────────────────────────────────────
document.getElementById('clearBtn').addEventListener('click', () => {
  clearCanvas();
  document.getElementById('resultImg').style.display   = 'none';
  document.getElementById('placeholder').style.display = 'block';
  document.getElementById('errorMsg').style.display    = 'none';
});

// ── Connect to fal.ai realtime ────────────────────────────────
// Wrapped in try/catch so if connection fails, buttons still work
try {
  connectRealtime((imageUrl) => {
    const img = document.getElementById("resultImg");
    img.src   = imageUrl;
    img.style.display = "block";
    document.getElementById("placeholder").style.display = "none";
    document.getElementById("loadingOverlay").classList.remove("active");
  });
} catch (err) {
  console.error("Failed to connect to fal.ai:", err);
}

// ── Debounce timer ────────────────────────────────────────────
// Waits 400ms after you stop drawing, then sends to fal.ai
let debounceTimer = null;

function onStrokeDrawn() {
  clearTimeout(debounceTimer);

  // Show loading spinner while waiting
  document.getElementById("loadingOverlay").classList.add("active");
  document.getElementById("resultImg").style.display   = "none";
  document.getElementById("placeholder").style.display = "none";

  debounceTimer = setTimeout(() => {
    const prompt = document.getElementById("promptInput").value.trim()
      || "realistic photo, highly detailed";
    sendSketch(prompt);
  }, 400);
}