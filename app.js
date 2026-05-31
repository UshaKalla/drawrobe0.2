// ── app.js ────────────────────────────────────────────────────

// Connect to fal.ai as soon as the page loads
connectRealtime((imageUrl) => {
  const img = document.getElementById("resultImg");
  img.src = imageUrl;
  img.style.display = "block";
  document.getElementById("placeholder").style.display = "none";
});

// Debounce timer — sends sketch 400ms after you stop drawing
let debounceTimer = null;

// Call this from canvas.js every time a stroke is drawn
function onStrokeDrawn() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    const prompt = document.getElementById("promptInput").value.trim()
      || "realistic photo, highly detailed";
    sendSketch(prompt);
  }, 400);
}