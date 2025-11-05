// firebase.js
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";

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
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Export services
export const auth = firebase.auth();
export const db = firebase.firestore();
export default firebase;
