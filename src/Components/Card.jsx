// src/Card.jsx
import React, { useState, useRef } from "react";
import { elevenLabsSpeak } from "./utils";

const Card = ({ data, language, elevenApiKey, voiceMap }) => {
  // track currently playing index and stop function
  const [playingIndex, setPlayingIndex] = useState(null);
  const stopFnsRef = useRef({}); // index -> stop fn

  const handleSpeakToggle = async (index, title, description) => {
    const text = `${title}. ${description || ""}`;

    if (playingIndex === index) {
      // stop
      if (stopFnsRef.current[index]) {
        stopFnsRef.current[index]();
        delete stopFnsRef.current[index];
      }
      setPlayingIndex(null);
      return;
    }

    // stop any previous
    Object.values(stopFnsRef.current).forEach((fn) => fn && fn());
    stopFnsRef.current = {};

    // Try ElevenLabs first (if API key provided)
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
        console.warn("ElevenLabs TTS failed, falling back to speechSynthesis.", err);
        // continue to fallback
      }
    }

    // Fallback to browser speechSynthesis
    if (!window.speechSynthesis) {
      alert("Text-to-speech not supported in this browser.");
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);

    // language map for speechSynthesis
    const langMap = {
      en: "en-US",
      hi: "hi-IN",
      pa: "pa-IN",
      gu: "gu-IN",
      ta: "ta-IN",
    };

    utterance.lang = langMap[language] || "en-US";
    utterance.rate = 1;
    utterance.pitch = 1;

    // handle stop
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    // emulate stop fn
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
        // ensure an image for visual consistency
        if (!item.urlToImage) item.urlToImage = "";

        const newsText = `${item.title}. ${item.description || ""}`;

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
                  {/* speaker icon */}
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
