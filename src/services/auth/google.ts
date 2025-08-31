import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { auth } from '@/src/config/firebase-auth';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithCredential,
  type User
} from 'firebase/auth';

WebBrowser.maybeCompleteAuthSession();

const discovery = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
};

/**
 * Sign in with Google using Firebase Authentication
 * 
 * On web: Uses Firebase's signInWithPopup
 * On native: Shows a message that Google auth needs to be set up for production
 */
export async function signInWithGoogle(): Promise<User> {
  // Web: use Firebase popup
  if (Platform.OS === 'web') {
    const provider = new GoogleAuthProvider();
    provider.addScope('profile');
    provider.addScope('email');
    const cred = await signInWithPopup(auth, provider);
    return cred.user;
  }

  // Native (Expo Go): use Expo AuthSession proxy to obtain an id_token, then sign in to Firebase
  const clientId =
    Platform.select({
      ios: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
      android: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
      default: process.env.EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID,
    }) || process.env.EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID;

  if (!clientId) {
    throw new Error('Missing Google OAuth client ID. Set EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID.');
  }

  // Force Expo proxy redirect to avoid exp:// URLs in Google redirect_uri
  // Must EXACTLY match Google Console Authorized redirect URI
  const redirectUri = 'https://auth.expo.io/@mattenarle10/firebase-rn-poc';
  // Debug values to help diagnose redirect issues
  console.log('[GoogleAuth] clientId:', clientId);
  console.log('[GoogleAuth] redirectUri:', redirectUri);

  const request = new AuthSession.AuthRequest({
    clientId,
    responseType: AuthSession.ResponseType.Code,
    usePKCE: true,
    scopes: ['openid', 'profile', 'email'],
    redirectUri,
    extraParams: {
      // Helps avoid account stuck state on device
      prompt: 'select_account',
    },
  });

  await request.makeAuthUrlAsync(discovery);
  console.log('[GoogleAuth] request.redirectUri:', request.redirectUri);
  // @ts-ignore - useProxy/projectNameForProxy exist at runtime
  const result = await request.promptAsync(discovery, {
    useProxy: true,
    projectNameForProxy: '@mattenarle10/firebase-rn-poc',
    // Some SDK versions require explicit returnUrl to bind the session
    returnUrl: redirectUri,
  });

  console.log('[GoogleAuth] result.type:', (result as any).type);
  console.log('[GoogleAuth] result params:', (result as any).params);
  console.log('[GoogleAuth] has code:', !!(result as any)?.params?.code);
  if (result.type !== 'success') {
    throw new Error(
      result.type === 'error'
        ? result.error?.message ?? 'Google auth error'
        : 'Google auth cancelled'
    );
  }

  const code = result.params?.code as string | undefined;
  if (!code) throw new Error('No authorization code returned from Google');

  // Exchange authorization code for tokens using PKCE (no client secret needed)
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      code,
      code_verifier: request.codeVerifier || '',
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }).toString(),
  });
  if (!tokenResponse.ok) {
    const txt = await tokenResponse.text();
    console.log('[GoogleAuth] token exchange error body:', txt);
    throw new Error(`Token exchange failed: ${tokenResponse.status} ${txt}`);
  }
  const tokenJson: { id_token?: string } = await tokenResponse.json();
  const idToken = tokenJson.id_token;
  if (!idToken) throw new Error('No id_token in token response from Google');

  const credential = GoogleAuthProvider.credential(idToken);
  const userCred = await signInWithCredential(auth, credential);
  return userCred.user;
}