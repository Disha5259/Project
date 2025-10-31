import React, { useEffect, useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import Card from "./Card";
import { translateText } from "./utils";
import { useNavigate } from "react-router-dom";

const API_KEY = "0e60539765174dfea87fc50c1d37dbd7";

const LANG_CONFIG = {
  en: { tl: "en" },
  hi: { tl: "hi" },
  pa: { tl: "pa" },
  gu: { tl: "gu" },
  ta: { tl: "ta" },
  de: { tl: "de" },
  fr: { tl: "fr" },
  es: { tl: "es" },
};

const Header = ({
  elevenApiKey,
  voiceMap,
  isLoggedIn = false,
  onLoginClick,
  onLogoutClick,
}) => {
  const [search, setSearch] = useState("india");
  const [newsData, setNewsData] = useState([]);
  const [language, setLanguage] = useState("en");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNews(search);
  }, []);

  useEffect(() => {
    if (!newsData || newsData.length === 0) return;
    translateArticles(language);
  }, [language]);

  const fetchNews = async (query) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&pageSize=20&apiKey=${API_KEY}`
      );
      const json = await res.json();
      if (json.status !== "ok") {
        setError(json.message || "NewsAPI error");
        setNewsData([]);
        return;
      }
      setNewsData(json.articles || []);
    } catch (err) {
      console.error("fetchNews error", err);
      setError("Failed to fetch news");
    } finally {
      setLoading(false);
    }
  };

  const translateArticles = async (targetLang) => {
    if (targetLang === "en") {
      setNewsData((prev) =>
        prev.map((a) => ({
          ...a,
          title: a.originalTitle || a.title,
          description: a.originalDescription || a.description,
        }))
      );
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const TOP_N = Math.min(10, newsData.length);
      const translated = await Promise.all(
        newsData.map(async (article, idx) => {
          const origTitle = article.originalTitle || article.title;
          const origDesc = article.originalDescription || article.description;

          if (idx >= TOP_N)
            return {
              ...article,
              originalTitle: origTitle,
              originalDescription: origDesc,
            };

          const target = LANG_CONFIG[targetLang].tl || targetLang;
          const tTitle = await translateText(origTitle || "", target);
          const tDesc = await translateText(origDesc || "", target);

          return {
            ...article,
            originalTitle: origTitle,
            originalDescription: origDesc,
            title: tTitle,
            description: tDesc,
          };
        })
      );
      setNewsData(translated);
    } catch (err) {
      console.error("translateArticles error:", err);
      setError("Translation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <header className="header">
        <div className="header-top">
          {/* Logo */}
          <h1 className="logo">NewsRush</h1>

          {/* Search Bar */}
          <div className="search-bar">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search news..."
              className="search-input"
            />
            <button className="search-button" onClick={() => fetchNews(search)}>
              Search
            </button>
          </div>

          {/* Right Section */}
          <div className="header-right">
            <div className="login-section" onClick={onLoginClick || (() => navigate("/login"))}>
              <FaUserCircle className="login-icon" />
              <span className="login-text">Login</span>
            </div>

            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="language-select"
            >
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="pa">Punjabi</option>
              <option value="gu">Gujarati</option>
              <option value="ta">Tamil</option>
              <option value="de">German</option>
              <option value="fr">French</option>
              <option value="es">Spanish</option>
            </select>
          </div>
        </div>

        {/* Category Buttons */}
        <nav className="nav-buttons">
          {["Sports", "Politics", "Entertainment", "Health", "Fitness"].map(
            (cat) => (
              <button className="nav-button" key={cat} onClick={() => fetchNews(cat)}>
                {cat}
              </button>
            )
          )}
        </nav>
      </header>

      <main className="main-content">
        {loading && <div className="status">Loading...</div>}
        {error && <div className="status error">{error}</div>}

        {newsData && newsData.length > 0 ? (
          <Card
            data={newsData}
            language={language}
            elevenApiKey={elevenApiKey}
            voiceMap={voiceMap}
          />
        ) : (
          !loading && <div className="status">No articles yet.</div>
        )}
      </main>
    </div>
  );
};

export default Header;
