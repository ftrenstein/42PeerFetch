import { makeRedirectUri, useAuthRequest } from 'expo-auth-session';
import { AUTH_CONFIG } from '../constants/auth';
import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { saveTokens } from '../services/tokenManager';

const useAuth = () => {
    const [authError, setAuthError] = useState<string | null>(null);
    const [isAuthLoading, setIsAuthLoading] = useState(false);

    const discovery = {
        authorizationEndpoint: AUTH_CONFIG.authorizationEndpoint,
        tokenEndpoint: AUTH_CONFIG.tokenEndpoint,
    };

    const redirectUri = makeRedirectUri({
        scheme: 'exp',
        path: 'callback'
    });

    const config = {
        clientId: AUTH_CONFIG.clientId,
        scopes: AUTH_CONFIG.scopes,
        redirectUri: redirectUri,
    };
    console.log("Redirect URI", redirectUri)

    const [request, response, promptAsync] = useAuthRequest(config, discovery);

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
                    redirect_uri: redirectUri,
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
            router.replace('/(tabs)');
        } catch (error: any) {
            const msg = error?.message?.includes('fetch') || error?.message?.includes('network')
                ? 'Network error. Check your connection.'
                : error?.message || 'Authentication failed';
            setAuthError(msg);
            console.error('Error exchanging token:', error);
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
