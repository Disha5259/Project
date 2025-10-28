// src/utils.js
export const GOOGLE_TRANSLATE_URL = (text, targetLang) =>
  `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(
    text
  )}`;

/**
 * translateText: uses Google Translate unofficial endpoint.
 * Returns plain translated string (first sentence of results).
 */
export async function translateText(text, targetLang) {
  if (!text) return "";
  if (targetLang === "en") return text; // no-op for english

  try {
    const res = await fetch(GOOGLE_TRANSLATE_URL(text, targetLang));
    if (!res.ok) throw new Error("Translate API error");
    const data = await res.json();
    // data is nested array; join the translations
    const translated = data[0].map((part) => part[0]).join("");
    return translated;
  } catch (err) {
    console.error("translateText error:", err);
    return text; // fallback to original
  }
}

/**
 * elevenLabsSpeak: sends text to ElevenLabs TTS and returns an Audio object that plays the result.
 *
 * Important:
 * - You MUST supply a valid API key.
 * - You may need to change VOICE_IDs to voices in your ElevenLabs account that support the target language.
 *
 * This function:
 * - POSTs to v1/text-to-speech/{voiceId}
 * - expects audio/mpeg response (blob)
 * - returns an object { audio, stop } where audio is HTMLAudioElement
 */
export async function elevenLabsSpeak({
  apiKey,
  voiceId,
  text,
  model = "eleven_multilingual_v1",
  onProgress = null,
}) {
  if (!apiKey) throw new Error("ElevenLabs API key required");
  if (!voiceId) throw new Error("ElevenLabs voiceId required");

  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": apiKey,
      },
      body: JSON.stringify({
        text,
        model,
      }),
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`ElevenLabs TTS failed: ${res.status} ${txt}`);
    }

    const blob = await res.blob();
    const audioUrl = URL.createObjectURL(blob);
    const audio = new Audio(audioUrl);
    audio.preload = "auto";

    const stop = () => {
      audio.pause();
      audio.currentTime = 0;
      try {
        URL.revokeObjectURL(audioUrl);
      } catch (e) {}
    };

    return { audio, stop };
  } catch (err) {
    console.error("elevenLabsSpeak error:", err);
    throw err;
  }
}
