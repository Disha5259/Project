
export const GOOGLE_TRANSLATE_URL = (text, targetLang) =>
  `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(
    text
  )}`;

export async function translateText(text, targetLang) {
  if (!text) return "";
  if (targetLang === "en") return text;

  try {
    const res = await fetch(GOOGLE_TRANSLATE_URL(text, targetLang));
    if (!res.ok) throw new Error("Translate API error");
    const data = await res.json();
    const translated = data[0]?.map((part) => part[0]).join("") || text;
    return translated;
  } catch (err) {
    console.error("translateText error:", err);
    return text;
  }
}

export async function elevenLabsSpeak({
  apiKey,
  voiceId,
  text,
  model = "eleven_multilingual_v1",
}) {
  if (!apiKey || !voiceId) throw new Error("Missing API key or voiceId");
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "xi-api-key": apiKey,
    },
    body: JSON.stringify({ text, model }),
  });

  if (!res.ok) throw new Error(`ElevenLabs TTS failed: ${res.status}`);

  const blob = await res.blob();
  const audioUrl = URL.createObjectURL(blob);
  const audio = new Audio(audioUrl);
  audio.preload = "auto";

  const stop = () => {
    audio.pause();
    audio.currentTime = 0;
    URL.revokeObjectURL(audioUrl);
  };

  return { audio, stop };
}