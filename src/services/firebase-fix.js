// Alternative Firebase initialization for React Native/Expo
import { initializeApp, getApps } from 'firebase/app';
import { 
  getAuth, 
  initializeAuth, 
  getReactNativePersistence,
  browserLocalPersistence,
  indexedDBLocalPersistence 
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

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
} else {
  app = getApps()[0];
}

// Platform-specific initialization
let auth = null;
let db = null;

try {
  // Initialize Firestore (usually works fine)
  db = getFirestore(app);
  console.log("✅ Firestore initialized successfully");
} catch (error) {
  console.error("❌ Firestore initialization failed:", error);
}

// Platform-specific Auth initialization
try {
  if (Platform.OS === 'web') {
    // Web platform
    auth = getAuth(app);
    console.log("✅ Web Auth initialized");
  } else {
    // React Native platform
    try {
      // Try to get existing auth first
      auth = getAuth(app);
    } catch {
      // If that fails, initialize with persistence
      auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
      });
    }
    console.log("✅ React Native Auth initialized");
  }
} catch (error) {
  console.error("❌ Auth initialization failed:", error);
  console.warn("🔄 Falling back to local authentication");
  auth = null;
}

export { auth, db };
export default app;

// Helper functions to safely use Firebase Auth
export const safeAuth = {
  signInWithEmailAndPassword: async (email, password) => {
    if (!auth) throw new Error('Firebase Auth not available');
    const { signInWithEmailAndPassword } = await import('firebase/auth');
    return signInWithEmailAndPassword(auth, email, password);
  },
  
  createUserWithEmailAndPassword: async (email, password) => {
    if (!auth) throw new Error('Firebase Auth not available');
    const { createUserWithEmailAndPassword } = await import('firebase/auth');
    return createUserWithEmailAndPassword(auth, email, password);
  },
  
  signOut: async () => {
    if (!auth) throw new Error('Firebase Auth not available');
    const { signOut } = await import('firebase/auth');
    return signOut(auth);
  },
  
  onAuthStateChanged: (callback, errorCallback) => {
    if (!auth) {
      console.warn('Firebase Auth not available');
      return () => {}; // Return empty unsubscribe function
    }
    const { onAuthStateChanged } = require('firebase/auth');
    return onAuthStateChanged(auth, callback, errorCallback);
  }
};