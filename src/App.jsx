import React, { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";
import Header from "./Components/Header";
import Login from "./Components/Login";
import Signup from "./Components/Signup";

import { onAuthStateChanged, signOut } from "firebase/auth";

import { auth} from "./Components/FirebaseConfig";

function AppContent() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [language, setLanguage] = useState("en");
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("✅ Setting up Firebase Auth listener...");
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("🔥 Auth listener triggered. User:", user);
      if (user) {
        console.log("✅ User logged in:", user.email);
        setIsLoggedIn(true);
      } else {
        console.log("🚪 User logged out or not found");
        setIsLoggedIn(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const hideHeader =
    location.pathname === "/login" || location.pathname === "/signup";

  const handleLogout = async () => {
    console.log("🚨 Logging out...");
    await signOut(auth);
    setIsLoggedIn(false);
    navigate("/");
  };

  return (
    <div>
      {!hideHeader && (
        <Header
          key={isLoggedIn ? "loggedin" : "loggedout"} // force rerender
          isLoggedIn={isLoggedIn}
          onLogoutClick={handleLogout}
          onLoginClick={() => navigate("/login")}
          language={language}
          setLanguage={setLanguage}
        />
      )}

      <Routes>
        <Route
          path="/"
          element={<div className="text-center p-8"></div>}
        />
        <Route
          path="/login"
          element={
            <Login
              onLoginSuccess={() => {
                console.log("✅ Login success callback triggered");
                navigate("/");
              }}
            />
          }
        />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

