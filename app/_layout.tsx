import { Stack } from 'expo-router';
import { AuthProvider } from '../context/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack>
        <Stack.Screen name="index" options={{ title: '42 PeerFetch' }} />
        <Stack.Screen name="profile" options={{ headerShown: false }} />
        <Stack.Screen name="search" options={{ headerShown: false }} />
        <Stack.Screen name="callback" options={{ headerShown: false }} />
      </Stack>
    </AuthProvider>
  );
}
