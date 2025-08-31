import React, { useState } from 'react';
import { ActivityIndicator, Alert } from 'react-native';
import { View, Text, TextInput, TouchableOpacity } from '@/src/lib/nativewind';
import { useRouter, Link } from 'expo-router';
import { useAuth } from '@/src/hooks/useAuth';
import { signInWithGoogle, signInWithFacebook } from '@/src/services/auth';
import { z } from 'zod';

const emailSchema = z.string().trim().email('Please enter a valid email');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

export default function SignupScreen() {
  const { signUp } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    // validate both fields first
    setEmailError('');
    setPasswordError('');
    let hasError = false;

    try {
      emailSchema.parse(email);
    } catch (e) {
      if (e instanceof z.ZodError) {
        setEmailError(e.errors[0].message);
        hasError = true;
      }
    }
    try {
      passwordSchema.parse(password);
    } catch (e) {
      if (e instanceof z.ZodError) {
        setPasswordError(e.errors[0].message);
        hasError = true;
      }
    }
    if (hasError) return;

    try {
      setLoading(true);
      await signUp(email, password); // service should send verification if implemented there
      router.replace('/');
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', error instanceof Error ? error.message : 'Sign up failed');
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
        <Text className="text-2xl font-bold mb-6">Sign Up</Text>

        <View className="mb-4">
          <Text className="text-base font-medium mb-2">Email</Text>
          <TextInput
            className="border border-gray-300 rounded-lg p-3 text-base"
            placeholder="your@email.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          {emailError ? <Text className="text-red-500 text-xs mt-1">{emailError}</Text> : null}
        </View>

        <View className="mb-4">
          <Text className="text-base font-medium mb-2">Password</Text>
          <TextInput
            className="border border-gray-300 rounded-lg p-3 text-base"
            placeholder="Min 6 characters"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          {passwordError ? <Text className="text-red-500 text-xs mt-1">{passwordError}</Text> : null}
        </View>

        {loading ? (
          <ActivityIndicator className="mt-2 p-3.5" color="#007AFF" />
        ) : (
          <TouchableOpacity
            className="bg-blue-500 rounded-lg p-3.5 items-center mt-2"
            onPress={handleRegister}
          >
            <Text className="text-white text-base font-semibold">Create Account</Text>
          </TouchableOpacity>
        )}

        <View className="mt-4 flex-row justify-center">
          <Text className="text-gray-600">Already have an account? </Text>
          <Link href="/login" asChild>
            <TouchableOpacity>
              <Text className="text-blue-500 font-medium">Sign In</Text>
            </TouchableOpacity>
          </Link>
        </View>
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