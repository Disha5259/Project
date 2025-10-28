import React, { useState, useEffect } from 'react';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore, collection, addDoc, onSnapshot, query, serverTimestamp } from 'firebase/firestore';
 // ✅ Import your Firebase app

const categories = [
'General',
'Content Quality',
'Performance/Speed',
'UI/Design',
'Bug Report',
'Feature Request'
];

// --- Helper Components ---
const StarRating = ({ rating, setRating }) => {
return (
<div className="star-rating">
{[...Array(5)].map((_, index) => {
const starValue = index + 1;
return (
<button
key={index}
type="button"
onClick={() => setRating(starValue)}
className={`star-button ${starValue <= rating ? 'active' : ''}}
aria-label={Rate ${starValue} stars`}
>
★
</button>
);
})}
</div>
);
};

export default function App() {
const [db, setDb] = useState(null);
const [auth, setAuth] = useState(null);
const [userId, setUserId] = useState(null);
const [isAuthReady, setIsAuthReady] = useState(false);

const [formData, setFormData] = useState({
name: '',
rating: 5,
comment: '',
category: 'General'
});

const [submissionStatus, setSubmissionStatus] = useState('');
const [isLoading, setIsLoading] = useState(false);
const [feedbackList, setFeedbackList] = useState([]);

// ✅ Initialize Firestore & Anonymous Login
useEffect(() => {
try {
const firestoreDb = getFirestore(app);
const firebaseAuth = getAuth(app);
setDb(firestoreDb);
setAuth(firebaseAuth);

  const unsubscribe = firebaseAuth.onAuthStateChanged(async (user) => {
    if (user) {
      setUserId(user.uid);
    } else {
      await signInAnonymously(firebaseAuth);
    }
    setIsAuthReady(true);
  });

  return () => unsubscribe();
} catch (error) {
  console.error("Error initializing Firebase:", error);
}


}, []);

// ✅ Real-time Feedback Fetch
useEffect(() => {
if (!db || !isAuthReady) return;

const feedbackCollectionRef = collection(db, "feedback");
const feedbackQuery = query(feedbackCollectionRef);

const unsubscribe = onSnapshot(feedbackQuery, (snapshot) => {
  const fetchedFeedback = snapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
  setFeedbackList(fetchedFeedback);
});

return () => unsubscribe();


}, [db, isAuthReady]);

const handleChange = (e) => {
const { name, value } = e.target;
setFormData(prev => ({ ...prev, [name]: value }));
};

const handleRatingChange = (newRating) => {
setFormData(prev => ({ ...prev, rating: newRating }));
};

// ✅ Final Submit Handler
const handleSubmit = async (e) => {
e.preventDefault();
if (!db || !userId) {
setSubmissionStatus("Error: Database not ready or user not authenticated.");
return;
}
if (formData.comment.length < 5) {
setSubmissionStatus("Please provide a more detailed comment.");
return;
}

setIsLoading(true);
const feedbackData = {
  ...formData,
  userId,
  createdAt: serverTimestamp(),
};

try {
  await addDoc(collection(db, "feedback"), feedbackData);
  setSubmissionStatus("Thank you for your feedback! It has been posted.");
  setFormData({ name: '', rating: 5, comment: '', category: 'General' });
  setTimeout(() => setSubmissionStatus(''), 5000);
} catch (error) {
  console.error("Error adding document:", error);
  setSubmissionStatus("Error submitting feedback. Please try again.");
} finally {
  setIsLoading(false);
}


};

const getCategoryClass = (category) => {
switch (category) {
case 'Content Quality': return 'category-tag-green';
case 'Performance/Speed': return 'category-tag-red';
case 'UI/Design': return 'category-tag-yellow';
case 'Bug Report': return 'category-tag-pink';
case 'Feature Request': return 'category-tag-indigo';
default: return 'category-tag-general';
}
};

return (
<div className="feedback-card">
<header>
<h1 className="header-title">NewsRush Feedback</h1>
<p className="header-subtitle">We value your thoughts! Help us improve your news experience.</p>
</header>

  <section className="form-section">
    <h2 className="form-title">Share Your Feedback</h2>
    <form onSubmit={handleSubmit} className="form">
      <div className="form-group">
        <label htmlFor="name" className="form-label">Your Name</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g., A Satisfied Reader"
          className="form-input"
        />
      </div>

      <div className="form-group">
        <label className="form-label">
          Overall Rating: <span style={{ fontWeight: 700, color: '#F1F5F9' }}>{formData.rating} / 5</span>
        </label>
        <StarRating rating={formData.rating} setRating={handleRatingChange} />
      </div>

      <div className="form-group">
        <label htmlFor="category" className="form-label">Feedback Category</label>
        <select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          required
          className={`form-select ${getCategoryClass(formData.category)}`}
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="comment" className="form-label">Your Comments (Required)</label>
        <textarea
          id="comment"
          name="comment"
          rows="4"
          value={formData.comment}
          onChange={handleChange}
          required
          placeholder="What did you like or what can we improve?"
          className="form-textarea"
        ></textarea>
      </div>

      <div className="submit-container">
        <button type="submit" disabled={isLoading || !isAuthReady} className="submit-button">
          {isLoading ? 'Submitting...' : 'Submit Feedback'}
        </button>
        {submissionStatus && (
          <p className={`status-message ${submissionStatus.startsWith('Error') ? 'error' : 'success'}`}>
            {submissionStatus}
          </p>
        )}
      </div>
    </form>
  </section>

  <section>
    <h2 className="list-header">What Others Are Saying ({feedbackList.length})</h2>
    <div className="feedback-list">
      {feedbackList.length === 0 && (
        <p className="empty-list-message">No feedback has been submitted yet. Be the first!</p>
      )}
      {feedbackList.map((feedback) => (
        <div key={feedback.id} className="feedback-list-item">
          <div className="list-item-header">
            <div className="list-item-meta">
              <p className="list-item-name">{feedback.name || 'Anonymous User'}</p>
              {feedback.category && (
                <span className={`category-tag ${getCategoryClass(feedback.category)}`}>
                  {feedback.category}
                </span>
              )}
              <div className="list-item-stars">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={i < (feedback.rating || 0) ? 'active-star' : ''}>
                    &#9733;
                  </span>
                ))}
              </div>
            </div>
            <span className="list-item-date">
              {feedback.createdAt && feedback.createdAt.seconds
                ? new Date(feedback.createdAt.seconds * 1000).toLocaleDateString()
                : 'N/A'}
            </span>
          </div>
          <p className="list-item-comment">{feedback.comment}</p>
        </div>
      ))}
    </div>
  </section>
</div>


);
}