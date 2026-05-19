

export const AUTH_CONFIG = {
  clientId: 'u-s4t2ud-d6f658173ff90cf400c176c9b3797d083f353b549af13e20c5545a15f722fb7b',
  authorizationEndpoint: 'https://api.intra.42.fr/oauth/authorize',
  tokenEndpoint: 'https://api.intra.42.fr/oauth/token',
  scopes: ['public'],
  clientSecret: process.env.EXPO_PUBLIC_CLIENT_SECRET,
};
