import React, { useState } from 'react';
import { ActivityIndicator, Alert } from 'react-native';
import { View, Text, TextInput, TouchableOpacity } from '@/src/lib/nativewind';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/hooks/useAuth';
import { getSignInMethods } from '@/src/services/auth';
import { signInWithGoogle, signInWithFacebook } from '@/src/services/auth';
import { z } from 'zod';

const emailSchema = z.string().trim().email('Please enter a valid email');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

export default function LoginScreen() {
  const { signIn, signUp } = useAuth();
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isExistingAccount, setIsExistingAccount] = useState(false);
  const [loading, setLoading] = useState(false);
  const [providers, setProviders] = useState<string[]>([]);

  async function handleContinue() {
    try {
      // Validate email
      setEmailError('');
      const parsedEmail = emailSchema.parse(email);
      
      setLoading(true);
      // Check if email exists
      const methods = await getSignInMethods(parsedEmail);
      setProviders(methods);
      const hasPassword = methods.includes('password');
      setIsExistingAccount(hasPassword);
      // Move to next step; the UI will hide password when provider-only
      setShowPassword(true);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      if (error instanceof z.ZodError) {
        setEmailError(error.errors[0].message);
      } else {
        // Surface more helpful Firebase error info
        const err = error as any;
        const code = err?.code as string | undefined;
        const message = err?.message as string | undefined;
        let friendly = 'Failed to check email. Please try again.';
        if (code === 'auth/network-request-failed') friendly = 'Network error. Check your internet connection and try again.';
        else if (code === 'auth/invalid-api-key' || code === 'auth/app-not-authorized') friendly = 'Firebase configuration error. Please verify your Firebase credentials.';
        else if (code === 'auth/configuration-not-found') friendly = 'Firebase Auth provider not configured. In Firebase Console, enable Email/Password (or the relevant provider) under Authentication → Sign-in method.';
        else if (message) friendly = message;
        Alert.alert('Error', friendly);
      }
    }
  }

  async function handleSubmit() {
    try {
      setPasswordError('');
      passwordSchema.parse(password);
      
      setLoading(true);
      if (isExistingAccount) {
        // Sign in existing user
        await signIn(email, password);
      } else {
        // Create new account
        await signUp(email, password);
        // Email verification is sent in the service
      }
      
      router.replace('/');
    } catch (error) {
      setLoading(false);
      if (error instanceof z.ZodError) {
        setPasswordError(error.errors[0].message);
      } else {
        Alert.alert('Error', error instanceof Error ? error.message : 'Authentication failed');
      }
    }
  }

  async function handleGoogleSignIn() {
    try {
      setLoading(true);
      // If Google sign-in isn't implemented yet, provide a friendly message
      if (typeof signInWithGoogle !== 'function') {
        throw new Error('Google sign-in is not available yet');
      }
      await signInWithGoogle();
      router.replace('/');
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', error instanceof Error ? error.message : 'Google sign-in failed');
    }
  }

  async function handleFacebookSignIn() {
    try {
      setLoading(true);
      await signInWithFacebook();
      router.replace('/');
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', error instanceof Error ? error.message : 'Facebook sign-in failed');
    }
  }

  return (
    <View className="flex-1 p-5 justify-between">
      <View className="mt-10">
        <Text className="text-2xl font-bold mb-6">
          {(() => {
            const providerOnly = providers.length > 0 && !providers.includes('password');
            if (!showPassword) return 'Welcome';
            if (providerOnly) return 'Continue with your provider';
            return isExistingAccount ? 'Log in to your account' : 'Enter password to create account';
          })()}
        </Text>
        
        <View className="mb-4">
          <Text className="text-base font-medium mb-2">Email</Text>
          <TextInput
            className="border border-gray-300 rounded-lg p-3 text-base"
            placeholder="your@email.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!showPassword}
          />
          {emailError ? <Text className="text-red-500 text-xs mt-1">{emailError}</Text> : null}
        </View>

        {(() => {
          const providerOnly = providers.length > 0 && !providers.includes('password');
          return (
            <>
              {showPassword && !providerOnly && (
                <View className="mb-4">
                  <Text className="text-base font-medium mb-2">
                    {isExistingAccount ? 'Password' : 'Create password'}
                  </Text>
                  <TextInput
                    className="border border-gray-300 rounded-lg p-3 text-base"
                    placeholder={isExistingAccount ? '••••••••' : 'Min 6 characters'}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                  />
                  {passwordError ? <Text className="text-red-500 text-xs mt-1">{passwordError}</Text> : null}
                </View>
              )}

              {showPassword && providerOnly && (
                <View className="mb-4">
                  <Text className="text-base text-gray-700">
                    This email is registered with: {providers.map(p => (p === 'google.com' ? 'Google' : p === 'facebook.com' ? 'Facebook' : p)).join(', ')}.
                    Please continue with the corresponding provider below.
                  </Text>
                </View>
              )}
            </>
          );
        })()}

        {loading ? (
          <ActivityIndicator className="mt-2 p-3.5" color="#007AFF" />
        ) : (
          (() => {
            const providerOnly = providers.length > 0 && !providers.includes('password');
            const disabled = providerOnly;
            return (
              <TouchableOpacity 
                className={`rounded-lg p-3.5 items-center mt-2 ${disabled ? 'bg-gray-300' : 'bg-blue-500'}`}
                onPress={showPassword ? handleSubmit : handleContinue}
                disabled={disabled}
              >
                <Text className="text-white text-base font-semibold">
                  {providerOnly
                    ? 'Use a provider below'
                    : showPassword
                      ? (isExistingAccount ? 'Sign in' : 'Sign up')
                      : 'Continue'}
                </Text>
              </TouchableOpacity>
            );
          })()
        )}
      </View>

      <View className="mb-8">
        <Text className="text-center text-gray-500 my-5">or</Text>
        
        {(() => {
          const providerOnly = providers.length > 0 && !providers.includes('password');
          const googleEnabled = !providerOnly || providers.includes('google.com');
          return (
            <TouchableOpacity 
              className={`rounded-lg p-3.5 items-center mb-3 ${googleEnabled ? 'bg-[#4285F4]' : 'bg-gray-300'}`}
              onPress={handleGoogleSignIn}
              disabled={loading || !googleEnabled}
            >
              <Text className="text-white text-base font-medium">Continue with Google</Text>
            </TouchableOpacity>
          );
        })()}
        
        {(() => {
          const providerOnly = providers.length > 0 && !providers.includes('password');
          const facebookEnabled = !providerOnly || providers.includes('facebook.com');
          return (
            <TouchableOpacity 
              className={`rounded-lg p-3.5 items-center mb-3 ${facebookEnabled ? 'bg-[#3b5998]' : 'bg-gray-300'}`}
              onPress={handleFacebookSignIn}
              disabled={loading || !facebookEnabled}
            >
              <Text className="text-white text-base font-medium">Continue with Facebook</Text>
            </TouchableOpacity>
          );
        })()}
      </View>
    </View>
  );
}