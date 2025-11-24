import { useState, useEffect } from 'react';
import { User, AuthTokens } from '@/types/auth';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const storedTokens = sessionStorage.getItem('auth_tokens');
    const storedUser = sessionStorage.getItem('auth_user');

    if (storedTokens && storedUser) {
      setTokens(JSON.parse(storedTokens));
      setUser(JSON.parse(storedUser));
    }

    setLoading(false);
  }, []);

  const login = (userData: User, authTokens: AuthTokens) => {
    setUser(userData);
    setTokens(authTokens);
    sessionStorage.setItem('auth_user', JSON.stringify(userData));
    sessionStorage.setItem('auth_tokens', JSON.stringify(authTokens));
  };

  const logout = () => {
    setUser(null);
    setTokens(null);
    sessionStorage.removeItem('auth_user');
    sessionStorage.removeItem('auth_tokens');
  };

  return {
    user,
    tokens,
    loading,
    isAuthenticated: !!user && !!tokens,
    login,
    logout,
  };
}
