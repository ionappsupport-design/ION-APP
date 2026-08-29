import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { Capacitor } from '@capacitor/core';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoUrl: string | null;
}

export async function signInWithGoogle(): Promise<UserProfile | null> {
  try {
    const result = await FirebaseAuthentication.signInWithGoogle();
    if (result.user) {
      return {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoUrl: result.user.photoUrl,
      };
    }
    return null;
  } catch (error) {
    console.error('Google Sign-In failed:', error);
    throw error;
  }
}

export async function signInAnonymously(): Promise<UserProfile | null> {
  try {
    const result = await FirebaseAuthentication.signInAnonymously();
    if (result.user) {
      return {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoUrl: result.user.photoUrl,
      };
    }
    return null;
  } catch (error) {
    console.error('Anonymous Sign-In failed:', error);
    throw error;
  }
}

export async function getIdToken(): Promise<string | null> {
  try {
    const result = await FirebaseAuthentication.getIdToken();
    return result.token;
  } catch (error) {
    console.warn('Failed to get ID token:', error);
    return null;
  }
}

export async function signOut(): Promise<void> {
  try {
    await FirebaseAuthentication.signOut();
  } catch (error) {
    console.error('Sign out failed:', error);
    throw error;
  }
}

export async function getCurrentUser(): Promise<UserProfile | null> {
  try {
    const result = await FirebaseAuthentication.getCurrentUser();
    if (result.user) {
      return {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoUrl: result.user.photoUrl,
      };
    }
    return null;
  } catch (error) {
    // Expected to fail or return null if not logged in
    return null;
  }
}
