import * as SecureStore from 'expo-secure-store';
import { AUTH_CONFIG } from '../constants/auth';

const KEYS = {
  accessToken: 'access_token',
  refreshToken: 'refresh_token',
  expiresAt: 'token_expires_at',
};

// 42 API token response shape
interface RawTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;   // seconds from created_at
  created_at?: number;  // Unix timestamp; 42 includes this field
}

export async function saveTokens(data: RawTokenResponse): Promise<void> {
  const createdAt = data.created_at ?? Math.floor(Date.now() / 1000);
  const expiresAt = createdAt + data.expires_in;
  await Promise.all([
    SecureStore.setItemAsync(KEYS.accessToken, data.access_token),
    SecureStore.setItemAsync(KEYS.refreshToken, data.refresh_token),
    SecureStore.setItemAsync(KEYS.expiresAt, String(expiresAt)),
  ]);
  console.log(` Tokens saved — expires at ${new Date(expiresAt * 1000).toISOString()}`);
}

export async function clearTokens(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(KEYS.accessToken),
    SecureStore.deleteItemAsync(KEYS.refreshToken),
    SecureStore.deleteItemAsync(KEYS.expiresAt),
  ]);
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = await SecureStore.getItemAsync(KEYS.refreshToken);
  if (!refreshToken) {
    console.warn('No refresh token stored — user must log in again');
    return null;
  }

  console.log('Access token expired — refreshing...');
  try {
    const response = await fetch(AUTH_CONFIG.tokenEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: AUTH_CONFIG.clientId,
        client_secret: AUTH_CONFIG.clientSecret || '',
      }).toString(),
    });

    const data = await response.json();

    if (!response.ok || !data.access_token) {
      console.error('Refresh failed:', data.error || response.status);
      await clearTokens();
      return null;
    }

    await saveTokens(data);
    console.log('Token refreshed successfully');
    return data.access_token;
  } catch (error) {
    console.error('Refresh network error:', error);
    await clearTokens();
    return null;
  }
}

// Returns a valid access token, refreshing it first if it is expired or close to expiry.
// Returns null if not logged in or if refresh fails (caller should redirect to login).
export async function getValidToken(): Promise<string | null> {
  const [token, expiresAtStr] = await Promise.all([
    SecureStore.getItemAsync(KEYS.accessToken),
    SecureStore.getItemAsync(KEYS.expiresAt),
  ]);

  if (!token) return null;

  if (expiresAtStr) {
    const expiresAt = parseInt(expiresAtStr, 10);
    const nowSeconds = Math.floor(Date.now() / 1000);
    const BUFFER = 60; // refresh 1 minute before expiry

    if (nowSeconds >= expiresAt - BUFFER) {
      return refreshAccessToken();
    }
  }

  return token;
}
