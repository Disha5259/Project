

import React, { useState, useRef } from "react";
import { elevenLabsSpeak } from "./utils";

const Card = ({ data, language, elevenApiKey, voiceMap }) => {
  const [playingIndex, setPlayingIndex] = useState(null);
  const stopFnsRef = useRef({});

  const handleSpeakToggle = async (index, title, description) => {
    const text = `${title}. ${description || ""}`;

    if (playingIndex === index) {
      if (stopFnsRef.current[index]) {
        stopFnsRef.current[index]();
        delete stopFnsRef.current[index];
      }
      setPlayingIndex(null);
      return;
    }

    Object.values(stopFnsRef.current).forEach((fn) => fn && fn());
    stopFnsRef.current = {};

    // Try ElevenLabs TTS
    if (elevenApiKey) {
      try {
        const voiceId = voiceMap[language] || voiceMap["en"];
        const { audio, stop } = await elevenLabsSpeak({
          apiKey: elevenApiKey,
          voiceId,
          text,
        });

        stopFnsRef.current[index] = () => {
          stop();
          audio.pause();
          audio.currentTime = 0;
        };

        audio.onended = () => {
          delete stopFnsRef.current[index];
          setPlayingIndex(null);
        };

        audio.play();
        setPlayingIndex(index);
        return;
      } catch (err) {
        console.warn("ElevenLabs TTS failed, fallback to speechSynthesis", err);
      }
    }

    // Browser fallback
    if (!window.speechSynthesis) {
      alert("Text-to-speech not supported in this browser.");
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    const langMap = {
      en: "en-US",
      hi: "hi-IN",
      pa: "pa-IN",
      gu: "gu-IN",
      ta: "ta-IN",
      de: "de-DE",
      fr: "fr-FR",
      es: "es-ES",
    };

    utterance.lang = langMap[language] || "en-US";
    utterance.rate = 1;
    utterance.pitch = 1;

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);

    stopFnsRef.current[index] = () => {
      window.speechSynthesis.cancel();
      delete stopFnsRef.current[index];
    };

    utterance.onend = () => {
      delete stopFnsRef.current[index];
      setPlayingIndex(null);
    };

    setPlayingIndex(index);
  };

  return (
    <div className="cards-container">
      {data.map((item, index) => {
        if (!item.urlToImage) item.urlToImage = "";

        return (
          <div key={index} className="card">
            {item.urlToImage ? (
              <img className="card-img" src={item.urlToImage} alt={item.title} />
            ) : (
              <div className="placeholder-img">No Image</div>
            )}
            <div className="card-body">
              <a
                className="card-title"
                onClick={() => window.open(item.url, "_blank")}
                style={{ cursor: "pointer" }}
              >
                {item.title}
              </a>
              <p className="card-desc">{item.description}</p>

              <div className="card-actions">
                <button
                  className={`speak-btn ${playingIndex === index ? "playing" : ""}`}
                  onClick={() =>
                    handleSpeakToggle(index, item.title, item.description)
                  }
                  title={playingIndex === index ? "Stop" : "Speak"}
                >
                  <span className="speaker-icon">🔊</span>
                </button>

                <button
                  className="readmore-btn"
                  onClick={() => window.open(item.url, "_blank")}
                >
                  Read More
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Card;


