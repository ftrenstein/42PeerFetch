import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { router } from 'expo-router';
import { getValidToken, clearTokens } from '../services/tokenManager';

interface AuthContextType {
  isLoggedIn: boolean | null;
  logout: () => Promise<void>;
  notifyLoggedIn: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: null,
  logout: async () => {},
  notifyLoggedIn: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    getValidToken().then(token => {
      setIsLoggedIn(!!token);
      if (token) router.replace('/profile');
    });
  }, []);

  const logout = async () => {
    console.log('[AuthContext] logout: clearing tokens');
    await clearTokens();
    console.log('[AuthContext] logout: tokens cleared, navigating to /');
    setIsLoggedIn(false);
    router.replace('/');
  };

  const notifyLoggedIn = () => {
    setIsLoggedIn(true);
    router.replace('/profile');
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, logout, notifyLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuthState = () => useContext(AuthContext);
