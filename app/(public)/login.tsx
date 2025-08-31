import React, { useState } from 'react';
import { View, Text, TextInput, Button, ActivityIndicator, StyleSheet, TouchableOpacity, Alert } from 'react-native';
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
    <View style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Welcome</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="your@email.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!showPassword}
          />
          {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
        </View>

        {showPassword && (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              {isExistingAccount ? 'Password' : 'Create password'}
            </Text>
            <TextInput
              style={styles.input}
              placeholder={isExistingAccount ? '••••••••' : 'Min 6 characters'}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
          </View>
        )}

        {loading ? (
          <ActivityIndicator style={styles.button} />
        ) : (
          <TouchableOpacity 
            style={styles.button}
            onPress={showPassword ? handleSubmit : handleContinue}
          >
            <Text style={styles.buttonText}>
              {showPassword ? (isExistingAccount ? 'Sign in' : 'Sign up') : 'Continue'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.socialContainer}>
        <Text style={styles.dividerText}>or</Text>
        
        <TouchableOpacity 
          style={[styles.socialButton, styles.googleButton]}
          onPress={handleGoogleSignIn}
          disabled={loading}
        >
          <Text style={styles.socialButtonText}>Continue with Google</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.socialButton, styles.facebookButton]}
          onPress={handleFacebookSignIn}
          disabled={loading}
        >
          <Text style={styles.socialButtonText}>Continue with Facebook</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  formContainer: {
    marginTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  socialContainer: {
    marginBottom: 30,
  },
  dividerText: {
    textAlign: 'center',
    marginVertical: 20,
    color: '#666',
  },
  socialButton: {
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  googleButton: {
    backgroundColor: '#4285F4',
  },
  facebookButton: {
    backgroundColor: '#3b5998',
  },
  socialButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});