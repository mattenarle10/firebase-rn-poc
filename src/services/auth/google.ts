import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import Constants from 'expo-constants';
import {
  GoogleAuthProvider,
  signInWithCredential,
  signInWithPopup,
  User,
} from 'firebase/auth';

import { auth } from '@/src/config/firebase-auth';

// Initialize browser redirect handling
WebBrowser.maybeCompleteAuthSession();


const appScheme = Constants.expoConfig?.scheme || 'firebasernpoc';

// Google OAuth configuration
const googleConfig = {
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  scopes: ['profile', 'email', 'openid'],
};

// Get appropriate client ID for the platform
function getGoogleClientId(): string | undefined {
  if (Platform.OS === 'web') return googleConfig.webClientId;
  if (Platform.OS === 'ios') return googleConfig.iosClientId;
  if (Platform.OS === 'android') return googleConfig.androidClientId;
  return undefined;
}

// Compute redirect URI
// For development builds, use Expo AuthSession proxy to satisfy Google Web Client redirect URI policies
function getRedirectUri(): string {
  if (Platform.OS === 'web') {
    return window.location.origin;
  }
  // Explicit proxy URL for this project
  return 'https://auth.expo.io/@mattenarle10/firebase-rn-poc';
}

/**
 * Sign in with Google using Firebase Authentication
 *
 * Handles different platforms appropriately:
 * - Web: Uses Firebase's signInWithPopup
 * - Development Build: Uses PKCE with Expo AuthSession proxy redirect
 *
 * @returns {Promise<User>} Firebase User object
 */
export async function signInWithGoogle(): Promise<User> {
  // Web platform: use Firebase popup sign-in
  if (Platform.OS === 'web') {
    const provider = new GoogleAuthProvider();
    googleConfig.scopes.forEach(scope => provider.addScope(scope));
    const cred = await signInWithPopup(auth, provider);
    return cred.user;
  }

  // Get the appropriate client ID for this platform
  const clientId = getGoogleClientId();
  if (!clientId) {
    throw new Error('Missing Google OAuth client ID for this platform');
  }

  // Get redirect URI appropriate for this environment (Expo proxy for dev build)
  const redirectUri = getRedirectUri();
  
  // Security parameters
  const state = Math.random().toString(36).substring(2, 15);
  const nonce = Math.random().toString(36).substring(2, 15);
  
  // Log configuration for debugging
  console.log('[GoogleAuth] Platform:', Platform.OS);
  console.log('[GoogleAuth] App scheme:', appScheme);
  console.log('[GoogleAuth] clientId:', clientId);
  console.log('[GoogleAuth] redirectUri:', redirectUri);
  console.log('[GoogleAuth] Dev build mode: active');
  
  try {
    // Build PKCE authorization request
    const scopes = googleConfig.scopes;
    const discovery = {
      authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenEndpoint: 'https://oauth2.googleapis.com/token',
    };

    // IMPORTANT: For native with proxy, use the Web client ID
    const nativeClientId = googleConfig.webClientId;
    if (!nativeClientId) {
      throw new Error('Missing EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID in .env for PKCE flow');
    }

    const request = new AuthSession.AuthRequest({
      clientId: nativeClientId,
      redirectUri,
      scopes,
      responseType: AuthSession.ResponseType.Code,
      usePKCE: true,
      extraParams: { access_type: 'offline', prompt: 'consent', state, nonce },
    });

    const authUrl = await request.makeAuthUrlAsync(discovery);
    console.log('[GoogleAuth] Starting authentication (PKCE via proxy)...');

    const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);
    if (result.type !== 'success' || !result.url) {
      if (result.type === 'cancel') {
        throw new Error('Google sign-in was canceled');
      }
      console.log('[GoogleAuth] Authentication failed with result:', result);
      throw new Error('Google sign-in failed');
    }

    // Parse "code" from callback URL
    const url = new URL(result.url);
    const code = url.searchParams.get('code');
    if (!code) {
      throw new Error('Missing authorization code in redirect URL');
    }

    console.log('[GoogleAuth] Exchanging code for tokens...');
    const tokenResponse = await AuthSession.exchangeCodeAsync(
      {
        clientId: nativeClientId,
        code,
        redirectUri,
        extraParams: { code_verifier: request.codeVerifier! },
      },
      discovery
    );

    const idToken = tokenResponse.idToken as string | undefined;
    const accessToken = tokenResponse.accessToken as string | undefined;

    if (!idToken && !accessToken) {
      throw new Error('No tokens returned from token exchange');
    }

    const credential = GoogleAuthProvider.credential(idToken || null, accessToken);

    console.log('[GoogleAuth] Signing in to Firebase...');
    const userCred = await signInWithCredential(auth, credential);
    console.log('[GoogleAuth] Successfully signed in as:', userCred.user.email);
    return userCred.user;
  } catch (error) {
    console.error('[GoogleAuth] Error during sign-in:', error);
    throw error;
  }
}