import { View, Text, StyleSheet, Button } from 'react-native';
import { makeRedirectUri, useAuthRequest } from 'expo-auth-session';
import * as SecureStore from 'expo-secure-store';
import { AUTH_CONFIG } from '../constants/auth';
import { useEffect } from 'react';

export default function SearchScreen() {
  const discovery = {
    authorizationEndpoint: AUTH_CONFIG.authorizationEndpoint,
    tokenEndpoint: AUTH_CONFIG.tokenEndpoint,
  };

  const config = {
    clientId: AUTH_CONFIG.clientId,
    scopes: AUTH_CONFIG.scopes,
    redirectUri: makeRedirectUri({ scheme: 'peerfetch', path: 'callback' }),
  };
const redirectUri = makeRedirectUri({ scheme: 'peerfetch', path: 'callback' });
console.log('Redirect URI:', redirectUri);


  const [request, response, promptAsync] = useAuthRequest(config, discovery);

  const exchangeToken = async (code: string) => {
   try { const tokenResponse = await fetch(AUTH_CONFIG.tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: AUTH_CONFIG.clientId,
        redirect_uri: makeRedirectUri({ scheme: 'peerfetch', path: 'callback' }),
        client_secret: (AUTH_CONFIG.clientSecret || '')
      }).toString(),
    });
    const tokenData = await tokenResponse.json();
    await SecureStore.setItemAsync('access_token', tokenData.access_token);
    console.log('Access token:', tokenData.access_token);
   }
    catch (error) {
      console.error('Error exchanging token:', error);
    } 
  }

  useEffect(() => {
    if (response?.type === 'success') {
      const { code } = response.params;
      // Exchange the authorization code for an access token
      // You would typically send this code to your backend server to exchange it securely
      console.log('Authorization code:', code);
      exchangeToken(code);
    }
  }, [response]);

  return (
    <View style={styles.container}>
      <Text>Screen 1 - Login </Text>
      <Button title="Login with 42 API" onPress={() => promptAsync()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
