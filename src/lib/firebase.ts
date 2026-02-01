import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  User,
  signInWithPopup,
  GoogleAuthProvider,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA5TDftINHtCt_9JPpXqnjtUwz9noakpbg",
  authDomain: "awsquiz-97b07.firebaseapp.com",
  projectId: "awsquiz-97b07",
  storageBucket: "awsquiz-97b07.firebasestorage.app",
  messagingSenderId: "9288025402",
  appId: "1:9288025402:web:bbc716085a499c5cd8bc03",
  measurementId: "G-5353PZKDDP"
};

// Initialize Firebase (singleton pattern)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

// Set persistence to local (keep user signed in across sessions)
setPersistence(auth, browserLocalPersistence);

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();

// Auth functions
export const firebaseAuth = {
  // Sign up with email and password
  signUp: async (email: string, password: string, displayName?: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Update display name if provided
      if (displayName && userCredential.user) {
        await updateProfile(userCredential.user, { displayName });
      }

      // Get ID token for API calls
      const token = await userCredential.user.getIdToken();

      return {
        user: userCredential.user,
        token
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign up';
      throw new Error(errorMessage);
    }
  },

  // Sign in with email and password
  signIn: async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken();

      return {
        user: userCredential.user,
        token
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign in';
      throw new Error(errorMessage);
    }
  },

  // Sign in with Google
  signInWithGoogle: async () => {
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const token = await userCredential.user.getIdToken();

      return {
        user: userCredential.user,
        token
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign in with Google';
      throw new Error(errorMessage);
    }
  },

  // Sign out
  signOut: async () => {
    try {
      await signOut(auth);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign out';
      throw new Error(errorMessage);
    }
  },

  // Send password reset email
  resetPassword: async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to reset password';
      throw new Error(errorMessage);
    }
  },

  // Get current user
  getCurrentUser: () => {
    return auth.currentUser;
  },

  // Get ID token for API calls
  getIdToken: async () => {
    const user = auth.currentUser;
    if (!user) return null;

    try {
      return await user.getIdToken();
    } catch (error) {
      console.error('Error getting ID token:', error);
      return null;
    }
  },

  // Subscribe to auth state changes
  onAuthStateChange: (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, callback);
  },

  // Update user profile
  updateUserProfile: async (updates: { displayName?: string; photoURL?: string }) => {
    const user = auth.currentUser;
    if (!user) throw new Error('No user logged in');

    try {
      await updateProfile(user, updates);
      return user;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
      throw new Error(errorMessage);
    }
  }
};

// Helper to sync user with backend
export const syncUserWithBackend = async (user: User) => {
  try {
    const token = await user.getIdToken();

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        firebaseUid: user.uid,
        email: user.email,
        name: user.displayName || user.email?.split('@')[0],
        profileImage: user.photoURL
      })
    });

    if (!response.ok) {
      throw new Error('Failed to sync user with backend');
    }

    return await response.json();
  } catch (error) {
    console.error('Error syncing user with backend:', error);
    throw error;
  }
};

export { auth };
export default app;