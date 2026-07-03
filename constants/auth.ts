

export const AUTH_CONFIG = {
  clientId: process.env.EXPO_PUBLIC_42_CLIENT_ID || '',
  authorizationEndpoint: 'https://api.intra.42.fr/oauth/authorize',
  tokenEndpoint: 'https://api.intra.42.fr/oauth/token',
  scopes: ['public'],
  clientSecret: process.env.EXPO_PUBLIC_42_CLIENT_SECRET,
};
