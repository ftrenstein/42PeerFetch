import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useEffect } from 'react';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import useAuth from '../hooks/useAuth';

export default function LoginScreen() {
  const { promptAsync, authError, isAuthLoading } = useAuth();

  useEffect(() => {
    SecureStore.getItemAsync('access_token').then(token => {
      if (token) router.replace('/(tabs)');
    });
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>42 PeerFetch</Text>

      <TouchableOpacity
        style={[styles.button, isAuthLoading && styles.buttonDisabled]}
        onPress={() => promptAsync()}
        disabled={isAuthLoading}
      >
        {isAuthLoading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.buttonText}>Login with 42</Text>
        }
      </TouchableOpacity>

      {authError && <Text style={styles.error}>{authError}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 10,
    minWidth: 200,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#a0c4ff',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  error: {
    color: '#FF3B30',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 24,
    marginTop: 8,
  },
});
