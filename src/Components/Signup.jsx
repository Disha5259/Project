import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "./FirebaseConfig";// 🔥 your firebase.js file

export default function Signup() {
const [name, setName] = useState("");
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [loading, setLoading] = useState(false);
const [showWelcome, setShowWelcome] = useState(false);
const [message, setMessage] = useState("");

const navigate = useNavigate();

const handleSignup = async (e) => {
e.preventDefault();
setLoading(true);
setMessage("");

try {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );
  const user = userCredential.user;

  await updateProfile(user, { displayName: name });

  // Show welcome message
  setShowWelcome(true);

  // Redirect after 2 seconds
  setTimeout(() => {
    setShowWelcome(false);
    navigate("/home");
  }, 2000);
} catch (error) {
  let errMsg = error.code
    ? error.code.replace("auth/", "").replace(/-/g, " ")
    : "Unknown error";
  errMsg = errMsg.charAt(0).toUpperCase() + errMsg.slice(1);
  setMessage(`Error: ${errMsg}`);
} finally {
  setLoading(false);
}


};

if (showWelcome) {
return (
<div className="welcome-screen">
<h1 className="welcome-text">🎉 Welcome to NewsRush, {name}!</h1>
</div>
);
}

return (
<div className="signup-container">
<div className="signup-card">
<h1 className="signup-title">Create Account</h1>
<p className="signup-subtitle">Join the NewsRush community today!</p>

    <form onSubmit={handleSignup}>
      <div className="input-group">
        <label>Full Name</label>
        <input
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={loading}
        />
      </div>

      <div className="input-group">
        <label>Email Address</label>
        <input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />
      </div>

      <div className="input-group">
        <label>Password</label>
        <input
          type="password"
          placeholder="Min 6 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          disabled={loading}
        />
      </div>

      <button type="submit" disabled={loading} className="signup-button">
        {loading ? "Creating Account..." : "Sign Up"}
      </button>

      {message && (
        <p className={`message ${message.includes("Error") ? "error" : ""}`}>
          {message}
        </p>
      )}
    </form>

    <p className="switch-text">
      Already have an account?{" "}
      <button className="switch-link" onClick={() => navigate("/login")}>
        Login
      </button>
    </p>
  </div>
</div>


);
}