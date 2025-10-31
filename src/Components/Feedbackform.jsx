import React, { useState, useEffect } from "react";
import { signInAnonymously, onAuthStateChanged } from "firebase/auth";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { app, auth, db } from "./FirebaseConfig"; // ✅ Correct import
import "./Feedback.css"; // ✅ your existing styles

const FeedbackForm = () => {
  const [userId, setUserId] = useState("");
  const [isAuthReady, setIsAuthReady] = useState(false);

  const [name, setName] = useState("");
  const [rating, setRating] = useState(0);
  const [feedbackType, setFeedbackType] = useState("UI/Design");
  const [description, setDescription] = useState("");
  const [feedbackList, setFeedbackList] = useState([]);
  const [status, setStatus] = useState("");

  // ⭐ Firebase Auth setup
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          setUserId(user.uid);
        } else {
          const result = await signInAnonymously(auth);
          setUserId(result.user.uid);
        }
      } catch (error) {
        console.error("Auth Error:", error);
      } finally {
        setIsAuthReady(true);
      }
    });

    return () => unsubscribe();
  }, []);

  // ⭐ Fetch all feedback
  useEffect(() => {
    const q = query(collection(db, "feedback"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const feedbacks = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setFeedbackList(feedbacks.sort((a, b) => b.timestamp - a.timestamp));
    });
    return () => unsubscribe();
  }, []);

  // ⭐ Submit feedback
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim() || rating === 0 || !description.trim()) {
      setStatus("Please fill all required fields ⭐");
      return;
    }

    try {
      await addDoc(collection(db, "feedback"), {
        name,
        rating,
        feedbackType,
        description,
        userId,
        timestamp: serverTimestamp(),
      });

      setName("");
      setRating(0);
      setFeedbackType("UI/Design");
      setDescription("");
      setStatus("✅ Feedback submitted successfully!");
    } catch (error) {
      console.error("Error submitting feedback:", error);
      setStatus("❌ Failed to submit feedback. Try again!");
    }
  };

  return (
    <div className="app-container">
      <div className="feedback-card">
       <header>
<h1 className="header-title">Give Us Feedback</h1>
<p className="header-subtitle">
Help us improve NewsRush — report a bug or suggest a new feature
</p>
</header>

        <form onSubmit={handleSubmit} className="form-section">
          {/* Name */}
          <div className="form-group">
            <label className="form-label">Your Name</label>
            <input
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
            />
          </div>

          {/* Rating */}
          <div className="form-group">
            <label className="form-label">Your Rating (Required)</label>
            <div className="star-rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  className={`star-button ${star <= rating ? "active" : ""}`}
                  onClick={() => setRating(star)}
                >
                  ★
                </button>
              ))}
              <span style={{ color: "#f1f5f9", marginLeft: "0.5rem" }}>
                {rating > 0 ? `${rating}/5` : ""}
              </span>
            </div>
          </div>

          {/* Feedback Type */}
          <div className="form-group">
            <label className="form-label">Type of Feedback</label>
            <select
              className="form-select"
              value={feedbackType}
              onChange={(e) => setFeedbackType(e.target.value)}
            >
              <option value="UI/Design">Genral</option>
              <option value="UI/Design">UI/Design</option>
              <option value="Feature Request">Feature Request</option>
              <option value="Bug Report">Bug Report</option>
              <option value="Performance">Performance</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              rows="4"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Write your feedback..."
            />
          </div>

          {/* Submit */}
          <div className="submit-container">
            <button
              type="submit"
              className="submit-button"
              disabled={!isAuthReady}
            >
              Submit Feedback
            </button>
            {status && <p className="status-message success">{status}</p>}
          </div>
        </form>

        {/* Feedback List */}
        <div className="list-section">
          <h2 className="list-header">Recent Feedback</h2>
          {feedbackList.length === 0 ? (
            <div className="empty-list-message">No feedback yet.</div>
          ) : (
            <div className="feedback-list">
              {feedbackList.map((fb) => (
                <div key={fb.id} className="feedback-list-item">
                  <div className="list-item-header">
                    <span className="list-item-name">{fb.name}</span>
                    <span className="list-item-date">
                      {fb.timestamp?.toDate
                        ? fb.timestamp.toDate().toLocaleString()
                        : "Just now"}
                    </span>
                  </div>
                  <div className="list-item-stars">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span
                        key={i}
                        className={i < fb.rating ? "active-star" : ""}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <p className="list-item-comment">{fb.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedbackForm;
