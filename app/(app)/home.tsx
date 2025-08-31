import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/hooks/useAuth';

export default function HomeScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!user) {
      router.replace('/');
    }
  }, [user, router]);

  const providerLabels = React.useMemo(() => {
    const ids = user?.providerData?.map((p) => p.providerId) ?? [];
    const mapId = (id: string) =>
      id === 'password' ? 'Email/Password' : id === 'google.com' ? 'Google' : id === 'facebook.com' ? 'Facebook' : undefined;
    const labels = ids.map(mapId).filter(Boolean) as string[];
    return labels.join(', ');
  }, [user]);

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>Hi {user?.email ?? 'there'} 👋</Text>
      <Text style={styles.message}>You're signed in!</Text>
      {providerLabels ? <Text style={styles.provider}>Signed in with: {providerLabels}</Text> : null}
      
      <TouchableOpacity style={styles.button} onPress={signOut}>
        <Text style={styles.buttonText}>Sign out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
  },
  provider: {
    fontSize: 14,
    color: '#333',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    padding: 14,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});