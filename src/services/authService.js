import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth, db, firebaseReady } from './firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

// Helper function to ensure Firebase is ready before operations
const ensureFirebaseReady = async () => {
  await firebaseReady;
  if (!auth) {
    throw new Error('Firebase Auth is not available');
  }
  return auth;
};

// Safe wrapper functions for Firebase Auth operations
export const signUpWithEmail = async (email, password) => {
  try {
    const authInstance = await ensureFirebaseReady();
    console.log("🔐 Attempting signup for:", email);
    
    const userCredential = await createUserWithEmailAndPassword(authInstance, email, password);
    console.log("✅ Signup successful:", userCredential.user.uid);
    return userCredential.user;
  } catch (error) {
    console.error("❌ Signup error:", error.code, error.message);
    throw error;
  }
};

export const signInWithEmail = async (email, password) => {
  try {
    const authInstance = await ensureFirebaseReady();
    console.log("🔐 Attempting signin for:", email);
    
    const userCredential = await signInWithEmailAndPassword(authInstance, email, password);
    console.log("✅ Signin successful:", userCredential.user.uid);
    return userCredential.user;
  } catch (error) {
    console.error("❌ Signin error:", error.code, error.message);
    throw error;
  }
};

export const signOut = async () => {
  try {
    const authInstance = await ensureFirebaseReady();
    await firebaseSignOut(authInstance);
    console.log("✅ Signout successful");
  } catch (error) {
    console.error("❌ Signout error:", error);
    throw error;
  }
};

export const resetPassword = async (email) => {
  try {
    const authInstance = await ensureFirebaseReady();
    console.log("📧 Sending password reset to:", email);
    
    await sendPasswordResetEmail(authInstance, email);
    console.log("✅ Password reset email sent");
    return { success: true, message: `Password reset email sent to ${email}` };
  } catch (error) {
    console.error("❌ Password reset error:", error);
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    const authInstance = await ensureFirebaseReady();
    return authInstance.currentUser;
  } catch (error) {
    console.error("❌ Get current user error:", error);
    return null;
  }
};

// Google Sign-In is not configured yet - placeholder function
export const signInWithGoogle = async () => {
  throw new Error('Google Sign-In is not configured yet. Please use email/password authentication.');
};
