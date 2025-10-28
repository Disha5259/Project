// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAxUsVOo2d2vzhlnqgi5EqscdEZ5JezaWo",
  authDomain: "newsrush-95423.firebaseapp.com",
  projectId: "newsrush-95423",
  storageBucket: "newsrush-95423.firebasestorage.app",
  messagingSenderId: "106167168303",
  appId: "1:106167168303:web:a5a14e750ffc3c454685da"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);