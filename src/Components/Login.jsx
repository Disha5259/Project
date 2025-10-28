import React, { useState } from "react";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { auth } from "./FirebaseConfig";
import { useNavigate } from "react-router-dom"; // ✅ added

export default function Login() {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // ✅ for redirect

  // 🔹 Google Sign-In
  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    setLoading(true);
    setMessage("");
    try {
      await signInWithPopup(auth, provider);
      setMessage("Google login successful! Welcome to NewsRush.");
      setTimeout(() => navigate("/"), 1000); // ✅ redirect after success
    } catch (error) {
      console.error(error);
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Email/Password Login or Signup
  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (isLoginMode) {
        await signInWithEmailAndPassword(auth, email, password);
        setMessage("Login successful! Welcome back to NewsRush.");
      } else {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;
        await updateProfile(user, { displayName: username.trim() });
        setMessage(`Sign Up successful! Welcome, ${username}.`);
      }

      // ✅ clear fields
      setEmail("");
      setPassword("");
      setUsername("");

      // ✅ redirect to homepage after success
      setTimeout(() => navigate("/"), 1000);
    } catch (error) {
      let errMsg = error.code
        ? error.code.replace("auth/", "").replace(/-/g, " ")
        : "Unknown error";
      errMsg = errMsg.charAt(0).toUpperCase() + errMsg.slice(1);
      setMessage(`Error: ${errMsg}.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <div className="auth-card">
        <h1 className="header-title">
          {isLoginMode ? "Sign In" : "Create Account"} to NewsRush
        </h1>
        <p className="header-subtitle">
          {isLoginMode
            ? "Access your personalized news feed."
            : "Join the NewsRush community today!"}
        </p>

        <form onSubmit={handleEmailAuth}>
          {!isLoginMode && (
            <div className="form-group">
              <label htmlFor="username" className="form-label">
                Username (Required)
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="form-input"
                placeholder="Your name"
                disabled={loading}
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="form-input"
              placeholder="you@example.com"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="form-input"
              placeholder="Min 6 characters"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="submit-button"
            disabled={
              loading ||
              !email ||
              !password ||
              (!isLoginMode && !username.trim())
            }
          >
            {loading ? "Processing..." : isLoginMode ? "Login" : "Sign Up"}
          </button>

          <div
            className={`status-message ${
              message.includes("Error") ? "error" : "success"
            }`}
          >
            {message}
          </div>
        </form>

        <button
          onClick={handleGoogleSignIn}
          className="submit-button"
          disabled={loading}
        >
          Continue with Google
        </button>

        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setIsLoginMode((prev) => !prev);
            setMessage("");
          }}
          className="switch-mode-link"
        >
          {isLoginMode
            ? "Don't have an account? Sign Up"
            : "Already have an account? Login"}
        </a>
      </div>
    </div>
  );
}
