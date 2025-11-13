import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC5DoYNaqLi-BiadRXSwPPh2PX6gjz7w8w",
  authDomain: "piggy-budget-fd4c8.firebaseapp.com",
  projectId: "piggy-budget-fd4c8",
  storageBucket: "piggy-budget-fd4c8.firebasestorage.app",
  messagingSenderId: "797394496691",
  appId: "1:797394496691:android:01b5f6881f4f85941994c6"
};

// Initialize Firebase app
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
  console.log("🔥 Firebase app initialized");
} else {
  app = getApps()[0];
  console.log("🔥 Using existing Firebase app");
}

// Initialize only Firestore (which works reliably)
let db = null;

try {
  db = getFirestore(app);
  console.log("✅ Firestore initialized successfully");
} catch (dbError) {
  console.error("❌ Firestore initialization failed:", dbError);
}

// Skip Firebase Auth initialization for now
const auth = null;
const firebaseReady = Promise.resolve(true);

console.log("🔥 Firebase setup complete - Auth: disabled (using local auth), DB:", !!db);

export { auth, db, firebaseReady };
export default app;
