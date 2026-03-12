import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBhe-o0Tq2BrqOgzjmVIqU1qih29QsamkA",
  authDomain: "cross-duel.firebaseapp.com",
  projectId: "cross-duel",
  storageBucket: "cross-duel.firebasestorage.app",
  messagingSenderId: "98338153295",
  appId: "1:98338153295:web:25bfb5673d920b77269b3a",
  databaseURL: "https://cross-duel-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig);

export const db = getDatabase(app);