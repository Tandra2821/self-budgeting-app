// Alternative: Use Expo AuthSession instead of Firebase Auth
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

WebBrowser.maybeCompleteAuthSession();

export class ExpoAuth {
  static async signUpWithEmail(email, password, name) {
    try {
      // For now, store in AsyncStorage (you can integrate with Firebase later)
      const usersJSON = await AsyncStorage.getItem("users");
      const users = usersJSON ? JSON.parse(usersJSON) : [];

      const exists = users.some((u) => u.email.toLowerCase() === email.toLowerCase());
      if (exists) {
        throw new Error('Email already registered');
      }

      const newUser = {
        id: Date.now().toString(),
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: password, // In production, hash this
        createdAt: new Date().toISOString(),
        provider: 'email'
      };

      users.push(newUser);
      await AsyncStorage.setItem("users", JSON.stringify(users));
      await AsyncStorage.setItem("currentUser", JSON.stringify(newUser));
      
      return { user: newUser, success: true };
    } catch (error) {
      throw error;
    }
  }

  static async signInWithEmail(email, password) {
    try {
      const usersJSON = await AsyncStorage.getItem("users");
      const users = usersJSON ? JSON.parse(usersJSON) : [];

      const user = users.find(
        (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );

      if (!user) {
        throw new Error('Invalid email or password');
      }

      await AsyncStorage.setItem("currentUser", JSON.stringify(user));
      return { user, success: true };
    } catch (error) {
      throw error;
    }
  }

  static async signOut() {
    try {
      await AsyncStorage.removeItem("currentUser");
      return { success: true };
    } catch (error) {
      throw error;
    }
  }

  static async getCurrentUser() {
    try {
      const currentUser = await AsyncStorage.getItem("currentUser");
      return currentUser ? JSON.parse(currentUser) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  // Optional: Add Google Sign-In later
  static async signInWithGoogle() {
    try {
      if (Platform.OS === 'web') {
        // Web implementation
        console.log('Google Sign-In not implemented for web yet');
        throw new Error('Google Sign-In not available on web');
      } else {
        // Mobile implementation with Expo AuthSession
        const request = new AuthSession.AuthRequest({
          clientId: 'your-google-client-id',
          scopes: ['openid', 'profile', 'email'],
          redirectUri: AuthSession.makeRedirectUri({
            scheme: 'your-app-scheme',
          }),
        });

        const result = await request.promptAsync({
          authorizationEndpoint: 'https://accounts.google.com/oauth/authorize',
        });

        if (result.type === 'success') {
          // Handle successful authentication
          console.log('Google auth successful:', result);
          // Process the result and create user session
        }

        return result;
      }
    } catch (error) {
      throw error;
    }
  }
}