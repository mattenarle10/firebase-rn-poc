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

  async function handleContinue() {
    try {
      // Validate email
      setEmailError('');
      const parsedEmail = emailSchema.parse(email);
      
      setLoading(true);
      // Check if email exists
      const methods = await getSignInMethods(parsedEmail);
      
      if (methods.includes('password')) {
        setIsExistingAccount(true);
      } else {
        setIsExistingAccount(false);
      }
      
      setShowPassword(true);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      if (error instanceof z.ZodError) {
        setEmailError(error.errors[0].message);
      } else {
        Alert.alert('Error', 'Failed to check email. Please try again.');
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
        <Text className="text-2xl font-bold mb-6">Welcome</Text>
        
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

        {showPassword && (
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

        {loading ? (
          <ActivityIndicator className="mt-2 p-3.5" color="#007AFF" />
        ) : (
          <TouchableOpacity 
            className="bg-blue-500 rounded-lg p-3.5 items-center mt-2"
            onPress={showPassword ? handleSubmit : handleContinue}
          >
            <Text className="text-white text-base font-semibold">
              {showPassword ? (isExistingAccount ? 'Sign in' : 'Sign up') : 'Continue'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <View className="mb-8">
        <Text className="text-center text-gray-500 my-5">or</Text>
        
        <TouchableOpacity 
          className="bg-[#4285F4] rounded-lg p-3.5 items-center mb-3"
          onPress={handleGoogleSignIn}
          disabled={loading}
        >
          <Text className="text-white text-base font-medium">Continue with Google</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          className="bg-[#3b5998] rounded-lg p-3.5 items-center mb-3"
          onPress={handleFacebookSignIn}
          disabled={loading}
        >
          <Text className="text-white text-base font-medium">Continue with Facebook</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}