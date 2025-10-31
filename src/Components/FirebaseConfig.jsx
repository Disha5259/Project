// src/firebaseConfig.jsx
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBPVEUtOoATyf1v0y9EpDtgpe-dJ4IRobk",
  authDomain: "newsrush-bb8f1.firebaseapp.com",
  projectId: "newsrush-bb8f1",
  storageBucket: "newsrush-bb8f1.appspot.com", // ✅ Correct now
  messagingSenderId: "858047810048",
  appId: "1:858047810048:web:f1504b195aaeca294de6e5",
};

// ✅ Initialize Firebase once
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
