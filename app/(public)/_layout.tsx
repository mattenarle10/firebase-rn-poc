import { Stack } from 'expo-router';

export default function PublicLayout() {
  return (
    <Stack>
      <Stack.Screen name="signin" options={{ title: 'Sign in' }} />
      <Stack.Screen name="signup" options={{ title: 'Sign up' }} />
    </Stack>
  );
}
