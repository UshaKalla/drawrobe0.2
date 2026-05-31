// ── api.js ────────────────────────────────────────────────────

const API_KEY   = "your-key-here";
const FAL_MODEL = "fal-ai/lcm-sd15-i2i";

let connection       = null;
let onResultCallback = null;

// Opens a persistent WebSocket connection to fal.ai
function connectRealtime(onResult) {
  onResultCallback = onResult;

  const ws = new WebSocket(
    `wss://fal.run/${FAL_MODEL}/realtime?fal_jwt_token=${API_KEY}`
  );

  // Tell the server we want plain JSON instead of msgpack binary
  ws.binaryType = "arraybuffer";

  ws.onopen = () => {
    console.log("✅ Connected to fal.ai realtime");
  };

  ws.onmessage = (event) => {
    try {
      // Handle both text and binary responses
      const text = typeof event.data === "string"
        ? event.data
        : new TextDecoder().decode(event.data);

      const data = JSON.parse(text);

      // Image comes back as base64 in sync_mode
      if (data.images?.[0]?.url) {
        onResultCallback(data.images[0].url);
      }
    } catch (err) {
      console.error("Failed to parse response:", err);
    }
  };

  ws.onerror = (err) => console.error("WebSocket error:", err);
  ws.onclose = () => console.log("WebSocket closed");

  connection = ws;
}

// Sends the current canvas to fal.ai as 512x512 base64
function sendSketch(prompt) {
  if (!connection || connection.readyState !== WebSocket.OPEN) {
    console.warn("WebSocket not open yet");
    return;
  }

  // Resize canvas to 512x512 — fastest inference size
  const offscreen = document.createElement("canvas");
  offscreen.width  = 512;
  offscreen.height = 512;
  offscreen.getContext("2d").drawImage(
    document.getElementById("sketchCanvas"), 0, 0, 512, 512
  );

  const base64 = offscreen.toDataURL("image/png");

  connection.send(JSON.stringify({
    prompt:              prompt,
    image_url:           base64,
    strength:            0.8,
    num_inference_steps: 4,
    guidance_scale:      1,
    sync_mode:           true,
  }));
}