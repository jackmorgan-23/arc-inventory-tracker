import { useState, useCallback, useMemo } from 'react';

/**
 * Mock authentication hook.
 * 
 * Currently simulates login/logout with local state for UI development.
 * When deploying to GCP, replace internals with Identity Platform's JS SDK
 * (firebase/auth) for real Google + Discord OAuth.
 */
export function useAuth() {
  const [user, setUser] = useState(null);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isAuthenticated = !!user;

  const login = useCallback(async (provider) => {
    setIsLoading(true);
    
    // TODO: Replace with real Identity Platform OAuth flow
    // e.g., signInWithPopup(auth, new GoogleAuthProvider())
    await new Promise(resolve => setTimeout(resolve, 800));

    const mockUsers = {
      google: {
        displayName: 'Arc Raider',
        email: 'raider@gmail.com',
        provider: 'google',
      },
      discord: {
        displayName: 'Arc Raider',
        email: 'raider#1234',
        provider: 'discord',
      },
    };

    setUser(mockUsers[provider] || mockUsers.google);
    setIsLoading(false);
    setShowLoginDialog(false);
  }, []);

  const logout = useCallback(() => {
    // TODO: Replace with real signOut(auth)
    setUser(null);
  }, []);

  const openLoginDialog = useCallback(() => {
    setShowLoginDialog(true);
  }, []);

  const closeLoginDialog = useCallback(() => {
    setShowLoginDialog(false);
  }, []);

  return useMemo(() => ({
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    showLoginDialog,
    setShowLoginDialog,
    openLoginDialog,
    closeLoginDialog,
  }), [user, isAuthenticated, isLoading, login, logout, showLoginDialog, openLoginDialog, closeLoginDialog]);
}
