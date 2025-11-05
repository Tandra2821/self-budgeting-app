// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your Firebase config from Firebase console
const firebaseConfig = {
  apiKey: "AIzaSyAtTTFQ0OwHC9nKniJGT02ZN5OypYoyxn0",
  authDomain: "piggy-budget-fd4c8.firebaseapp.com",
  projectId: "piggy-budget-fd4c8",
  storageBucket: "piggy-budget-fd4c8.firebasestorage.app",
  messagingSenderId: "797394496691",
  appId: "1:797394496691:web:c9a204a438235a161994c6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
