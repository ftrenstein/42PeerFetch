import { makeRedirectUri, useAuthRequest } from 'expo-auth-session';
import { AUTH_CONFIG } from '../constants/auth';
import { useEffect, useMemo, useState } from 'react';
import { saveTokens } from '../services/tokenManager';
import { useAuthState } from '../context/AuthContext';

const DISCOVERY = {
    authorizationEndpoint: AUTH_CONFIG.authorizationEndpoint,
    tokenEndpoint: AUTH_CONFIG.tokenEndpoint,
};

const REDIRECT_URI = makeRedirectUri({ scheme: 'exp', path: 'callback' });

const CONFIG = {
    clientId: AUTH_CONFIG.clientId,
    scopes: AUTH_CONFIG.scopes,
    redirectUri: REDIRECT_URI,
};
console.log("redirect URL:", REDIRECT_URI)
const useAuth = () => {
    const [authError, setAuthError] = useState<string | null>(null);
    const [isAuthLoading, setIsAuthLoading] = useState(false);
    const { notifyLoggedIn } = useAuthState();

    const [request, response, promptAsync] = useAuthRequest(CONFIG, DISCOVERY);

    const exchangeToken = async (code: string) => {
        setIsAuthLoading(true);
        setAuthError(null);
        try {
            const tokenResponse = await fetch(AUTH_CONFIG.tokenEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    grant_type: 'authorization_code',
                    code,
                    client_id: AUTH_CONFIG.clientId,
                    redirect_uri: REDIRECT_URI,
                    client_secret: AUTH_CONFIG.clientSecret || '',
                }).toString(),
            });

            const tokenData = await tokenResponse.json();

            if (!tokenResponse.ok) {
                throw new Error(tokenData.error_description || tokenData.error || `Auth error ${tokenResponse.status}`);
            }
            if (!tokenData.access_token) {
                throw new Error('No access token received');
            }

            await saveTokens(tokenData);
            notifyLoggedIn();
        } catch (error: any) {
            const msg = error?.message?.includes('fetch') || error?.message?.includes('network')
                ? 'Network error. Check your connection.'
                : error?.message || 'Authentication failed';
            setAuthError(msg);
        } finally {
            setIsAuthLoading(false);
        }
    };

    useEffect(() => {
        if (response?.type === 'success') {

            const { code } = response.params;
            exchangeToken(code);
        } else if (response?.type === 'error') {
            const desc = (response.params?.error_description as string)
                || response.error?.message
                || 'Authorization failed';
            setAuthError(desc);
        } else if (response?.type === 'cancel') {
            setAuthError('Login was cancelled');
        }
    }, [response]);

    return { request, promptAsync, authError, isAuthLoading };
};

export default useAuth;
