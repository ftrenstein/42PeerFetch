import { makeRedirectUri, useAuthRequest } from 'expo-auth-session';
import * as SecureStore from 'expo-secure-store';
import { AUTH_CONFIG } from '../constants/auth';
import { useEffect } from 'react';


const useAuth = () => {
    const discovery = {
        authorizationEndpoint: AUTH_CONFIG.authorizationEndpoint,
        tokenEndpoint: AUTH_CONFIG.tokenEndpoint,
    };

    const redirectUri = makeRedirectUri({
        scheme: 'exp',
        path: 'callback'
    });
    console.log('Redirect URI:', redirectUri);

    const config = {
        clientId: AUTH_CONFIG.clientId,
        scopes: AUTH_CONFIG.scopes,
        redirectUri: redirectUri,
    };


    const [request, response, promptAsync] = useAuthRequest(config, discovery);

    const exchangeToken = async (code: string) => {
        try {
            const tokenResponse = await fetch(AUTH_CONFIG.tokenEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    grant_type: 'authorization_code',
                    code,
                    client_id: AUTH_CONFIG.clientId,
                    redirect_uri: redirectUri,
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

    return { request, promptAsync };
};

export default useAuth;