// ── api.js ────────────────────────────────────────────────────
// Handles all communication with the fal.ai API

const FAL_MODEL = 'fal-ai/lcm-sd15-i2i';

/**
 * Uploads a PNG blob to fal.ai storage and returns the hosted URL.
 * fal.ai requires a hosted URL — it does not accept raw base64.
 */
async function uploadImageToFal(blob, apiKey) {
  // Step 1: Request a presigned upload URL
  const initiateRes = await fetch('https://rest.fal.ai/storage/upload/initiate', {
    method: 'POST',
    headers: {
      'Authorization': `Key ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      content_type: 'image/png',
      file_name: 'sketch.png',
    }),
  });

  if (!initiateRes.ok) {
    const err = await initiateRes.json().catch(() => ({}));
    throw new Error(err.detail || `Upload initiate failed (${initiateRes.status})`);
  }

  const { upload_url, file_url } = await initiateRes.json();

  // Step 2: Upload the image blob to the presigned URL
  const putRes = await fetch(upload_url, {
    method: 'PUT',
    headers: { 'Content-Type': 'image/png' },
    body: blob,
  });

  if (!putRes.ok) {
    throw new Error(`Image upload failed (${putRes.status})`);
  }

  return file_url;
}

/**
 * Runs the LCM sketch-to-image model on fal.ai.
 * Returns the URL of the generated image.
 */
async function runSketchToImage({ imageUrl, prompt, apiKey }) {
  const res = await fetch(`https://fal.run/${FAL_MODEL}`, {
    method: 'POST',
    headers: {
      'Authorization': `Key ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      image_url:           imageUrl,
      prompt:              prompt,
      strength:            0.8,
      num_inference_steps: 4,
      guidance_scale:      1,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Model request failed (${res.status})`);
  }

  const data = await res.json();
  const url  = data.images?.[0]?.url;

  if (!url) throw new Error('No image returned from the model.');

  return url;
}

/**
 * Full pipeline: upload sketch → run model → return result URL
 */
async function generateFromSketch({ blob, prompt, apiKey }) {
  const imageUrl = await uploadImageToFal(blob, apiKey);
  const resultUrl = await runSketchToImage({ imageUrl, prompt, apiKey });
  return resultUrl;
}
