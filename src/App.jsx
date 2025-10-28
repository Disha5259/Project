import React, { useState } from "react";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import Header from "./Components/Header";
import Card from "./Components/Card";
import Login from "./Components/Login";
import Signup from "./Components/Signup";
import "./index.css";


const ELEVEN_API_KEY = "sk_de875e75b1b01464dc9ff094474cb09f4fc7a5e8a84691c5";

const VOICE_MAP = {
en: "21m00Tcm4TlvDq8ikWAM",
hi: "hi_voice_id_placeholder",
pa: "pa_voice_id_placeholder",
gu: "gu_voice_id_placeholder",
ta: "ta_voice_id_placeholder",
};

const AppContent = () => {
const location = useLocation();
const navigate = useNavigate();

const [language, setLanguage] = useState("en");
const [newsData, setNewsData] = useState([]);
const [isLoggedIn, setIsLoggedIn] = useState(false); // ✅ track login

const hideHeader = location.pathname === "/login" || location.pathname === "/signup";

const handleNavigate = (path) => {
navigate(path);
};

const handleLogout = () => {
setIsLoggedIn(false);
navigate("/"); // redirect to home after logout
};

return (
<div className="app">
{!hideHeader && (
<Header
language={language}
setLanguage={setLanguage}
newsData={newsData}
setNewsData={setNewsData}
elevenApiKey={ELEVEN_API_KEY}
voiceMap={VOICE_MAP}
onLoginClick={() => handleNavigate("/login")}
onSignupClick={() => handleNavigate("/signup")}
onLogoutClick={handleLogout}
isLoggedIn={isLoggedIn}
/>
)}

  <Routes>
    <Route
      path="/"
      element={
        <Card
          data={newsData}
          language={language}
          elevenApiKey={ELEVEN_API_KEY}
          voiceMap={VOICE_MAP}
        />
      }
    />
    <Route
      path="/login"
      element={<Login onLoginSuccess={() => setIsLoggedIn(true)} />}
    />
    <Route path="/signup" element={<Signup />} />
  </Routes>
</div>


);
};

const App = () => (
<BrowserRouter>
<AppContent />

</BrowserRouter>
);

export default App;