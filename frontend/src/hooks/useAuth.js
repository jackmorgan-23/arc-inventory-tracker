import { useState, useCallback, useMemo, useEffect } from 'react';
import { api } from '../lib/api';

/**
 * Authentication hook using direct Google Identity Services (OIDC).
 */
export function useAuth() {
  const [user, setUser] = useState(null);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Parse user from local storage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user_profile');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const logout = useCallback(() => {
    setIsLoading(true);
    api.logout()
      .catch((error) => {
        console.error("Logout failed:", error);
      })
      .finally(() => {
        setUser(null);
        localStorage.removeItem('google_id_token');
        localStorage.removeItem('session_id');
        localStorage.removeItem('user_profile');
        if (window.google?.accounts?.id) {
          window.google.accounts.id.disableAutoSelect();
        }
        setIsLoading(false);
      });
  }, []);

  const loginWithToken = useCallback(async (idToken) => {
    setIsLoading(true);
    try {
      // Verify with backend and let it establish the app session cookie.
      const data = await api.verifyToken(idToken);
      
      if (data.error) {
        throw new Error(data.error);
      }

      if (window.location.hostname === 'localhost') {
        localStorage.setItem('google_id_token', idToken);
      }

      // Store only safe profile data for UI hydration.
      const userProfile = {
        uid: data.uid,
        email: data.email,
      };
      if (data.sessionId) {
        localStorage.setItem('session_id', data.sessionId);
      }
      setUser(userProfile);
      localStorage.setItem('user_profile', JSON.stringify(userProfile));
      setShowLoginDialog(false);
    } catch (error) {
      console.error("Login verification failed:", error);
      alert("Login failed: " + error.message);
      logout(); // clean up on failure
    } finally {
      setIsLoading(false);
    }
  }, [logout]);

  const openLoginDialog = useCallback(() => {
    setShowLoginDialog(true);
  }, []);

  const closeLoginDialog = useCallback(() => {
    setShowLoginDialog(false);
  }, []);

  return useMemo(() => ({
    user,
    isAuthenticated: !!user,
    isLoading,
    loginWithToken, // new method
    logout,
    showLoginDialog,
    setShowLoginDialog,
    openLoginDialog,
    closeLoginDialog,
  }), [user, isLoading, loginWithToken, logout, showLoginDialog, openLoginDialog, closeLoginDialog]);
}
