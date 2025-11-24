'use client';

import React, { createContext, useContext, useCallback, useEffect, useState, useRef, useMemo } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletName } from '@solana/wallet-adapter-base';
import { overlayWS } from '@/lib/websocket';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_REST_URL || 'http://localhost:5001';
const SESSION_KEY = 'pm_auth';

// Backend unified response shape
type BackendAuthResponse = {
  success: boolean;
  authenticated: boolean;
  user?: {
    username: string;
    wallet: string;
  };
  needs_username?: boolean;
  needsUsername?: boolean; // Support both formats
  wallet?: string; // Top-level wallet (from backend)
  username?: string; // Top-level username (from backend)
};

type User = {
  username: string;
  wallet: string;
};

type AuthState = {
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  user: User | null;
  username: string | null;
  wallet: string | null;
  needsUsername: boolean;
  shouldShowUsernameModal: boolean;
};

const initialState: AuthState = {
  isAuthenticated: false,
  loading: false,
  error: null,
  user: null,
  username: null,
  wallet: null,
  needsUsername: false,
  shouldShowUsernameModal: false,
};

type AuthContextType = AuthState & {
  walletPublicKey: string | null;
  connectWalletAndSignIn: () => Promise<void>;
  setUsername: (username: string) => Promise<void>;
  logout: () => Promise<void>;
  // Legacy compatibility
  user: {
    id: string;
    wallet: string;
    username: string | null;
  } | null;
  wallet: string | null;
  connected: boolean;
  hasUser: boolean;
  hasUsername: boolean;
  userUsername: string | undefined;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Backend API calls
async function authenticateWallet(publicKey: string): Promise<BackendAuthResponse> {
  const response = await fetch(`${BACKEND_URL}/auth/wallet`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ publicKey }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Failed to authenticate wallet');
  }

  return response.json();
}

async function createUser(publicKey: string, username: string): Promise<BackendAuthResponse> {
  const response = await fetch(`${BACKEND_URL}/auth/create-user`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ publicKey, username }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Failed to create user');
  }

  return response.json();
}

// Helper function to restore session synchronously (before component mounts)
function getInitialState(): AuthState {
  if (typeof window === 'undefined') {
    return initialState;
  }

  try {
    const saved = window.localStorage.getItem(SESSION_KEY);
    if (saved) {
      const session = JSON.parse(saved);
      console.log('[AUTH] Restoring session from localStorage:', session);
      
      if (session.isAuthenticated && session.wallet) {
        const needsUsername = session.needsUsername || !session.username;
        return {
          isAuthenticated: true,
          loading: false,
          error: null,
          user: session.username ? { wallet: session.wallet, username: session.username } : { wallet: session.wallet, username: '' },
          username: session.username || null,
          wallet: session.wallet,
          needsUsername: needsUsername,
          shouldShowUsernameModal: needsUsername,
        };
      }
    }
  } catch (error) {
    console.error('[AUTH] Failed to restore session:', error);
    window.localStorage.removeItem(SESSION_KEY);
  }

  return initialState;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { publicKey, connected, connect, disconnect, select, wallet } = useWallet();
  const [state, setState] = useState<AuthState>(getInitialState);
  const initialSessionExists = typeof window !== 'undefined' && !!window.localStorage.getItem(SESSION_KEY);
  const [hasAuthenticatedThisSession, setHasAuthenticatedThisSession] = useState(initialSessionExists);
  const authenticatingRef = useRef(false);
  const wsAuthHandlerRef = useRef<((event: any) => void) | null>(null);
  const sessionRestoredRef = useRef(initialSessionExists);
  const wasConnectedRef = useRef(false);

  const cleanError = useCallback((err: any): string => {
    if (!err) return 'Unknown error';
    if (err.name) return err.name;
    if (err.message) return err.message;
    return String(err);
  }, []);

  // Update auth state helper - handles both needsUsername and authenticated cases
  // ALWAYS sets loading: false and saves to localStorage
  const updateAuthState = useCallback((response: BackendAuthResponse) => {
    console.log('[AUTH] updateAuthState called with:', response);
    
    const needsUsername = response.needs_username === true || response.needsUsername === true;
    const walletAddress = (response.wallet || response.user?.wallet || '').trim();
    const usernameValue = (response.username || response.user?.username || '').trim() || null;

    if (!response.success || !response.authenticated || !walletAddress) {
      console.error('[AUTH] Invalid response:', response);
      setState((s) => ({ ...s, loading: false }));
      return false;
    }

    if (needsUsername || !usernameValue) {
      // New user, needs username
      const newState: AuthState = {
        isAuthenticated: true,
        loading: false, // ALWAYS set loading to false
        error: null,
        user: walletAddress ? { wallet: walletAddress, username: '' } : null,
        username: null,
        wallet: walletAddress,
        needsUsername: true,
        shouldShowUsernameModal: true,
      };
      setState(newState);

      // Save to localStorage
      if (typeof window !== 'undefined' && walletAddress) {
        const sessionData = {
          isAuthenticated: true,
          wallet: walletAddress,
          username: null,
          needsUsername: true,
        };
        window.localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
        console.log('[AUTH] Saved to localStorage:', sessionData);
      }

      console.log('[AUTH] User authenticated, needs username:', walletAddress);
      return true;
    } else {
      // User authenticated with username
      const newState: AuthState = {
        isAuthenticated: true,
        loading: false, // ALWAYS set loading to false
        error: null,
        user: { wallet: walletAddress, username: usernameValue },
        username: usernameValue,
        wallet: walletAddress,
        needsUsername: false,
        shouldShowUsernameModal: false,
      };
      setState(newState);

      // Save to localStorage
      if (typeof window !== 'undefined' && walletAddress) {
        const sessionData = {
          isAuthenticated: true,
          wallet: walletAddress,
          username: usernameValue,
        };
        window.localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
        console.log('[AUTH] Saved to localStorage:', sessionData);
      }

      console.log('[AUTH] User authenticated:', usernameValue);
      return true;
    }
  }, []);

  // Verify session restoration on mount (already restored synchronously above)
  useEffect(() => {
    if (sessionRestoredRef.current && state.isAuthenticated) {
      console.log('[AUTH] Session verified on mount:', state.username);
    }
  }, []);

  // WebSocket auth message handler
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleAuthMessage = (event: { type: 'auth'; user: { username: string; wallet: string } }) => {
      console.log('[WS] Auth message received:', event.user);
      const response: BackendAuthResponse = {
        success: true,
        authenticated: true,
        user: {
          username: event.user.username,
          wallet: event.user.wallet,
        },
      };
      updateAuthState(response);
    };

    // Subscribe to WebSocket auth messages
    const unsubscribe = overlayWS.onAuth(handleAuthMessage);

    return () => {
      unsubscribe();
    };
  }, [updateAuthState]);

  const signInWithWallet = useCallback(async () => {
    if (!publicKey) {
      return;
    }

    if (authenticatingRef.current) {
      return;
    }

    const walletAddress = publicKey.toBase58();

    try {
      authenticatingRef.current = true;
      setState((s) => ({ ...s, loading: true, error: null }));

      // Call backend to authenticate wallet
      const result = await authenticateWallet(walletAddress);

      if (result.success && result.authenticated) {
        // Update state based on response
        updateAuthState(result);
        setHasAuthenticatedThisSession(true);
      } else {
        throw new Error('Unexpected authentication response');
      }
    } catch (err: any) {
      console.error('[AUTH] Authentication error:', cleanError(err));
      setState((s) => ({
        ...s,
        loading: false,
        error: 'Failed to authenticate wallet. Please try again.',
        isAuthenticated: false,
        user: null,
        username: null,
        wallet: null,
        needsUsername: false,
        shouldShowUsernameModal: false,
      }));
    } finally {
      authenticatingRef.current = false;
    }
  }, [publicKey, cleanError, updateAuthState]);

  // Public method: connect wallet then sign in
  const connectWalletAndSignIn = useCallback(async () => {
    try {
      // Single guard: prevent parallel calls
      if (authenticatingRef.current) {
        console.log('[WALLET] Already connecting, skipping duplicate call');
        return;
      }

      authenticatingRef.current = true;
      setState((s) => ({ ...s, loading: true, error: null }));

      // Check Phantom detection
      const phantomDetected = typeof window !== 'undefined' && window.solana?.isPhantom;
      if (!phantomDetected) {
        console.error('[WALLET] Phantom wallet not detected');
        setState((s) => ({
          ...s,
          loading: false,
          error: 'Phantom wallet not detected. Please install Phantom extension.',
        }));
        authenticatingRef.current = false;
        return;
      }

      console.log('[WALLET] Starting connection flow...');

      // STEP 1: ALWAYS select Phantom (no conditions, no skipping - atomic flow)
      if (!select || !connect) {
        console.error('[WALLET] Wallet adapter not available');
        setState((s) => ({
          ...s,
          loading: false,
          error: 'Wallet adapter not available. Please refresh the page.',
        }));
        authenticatingRef.current = false;
        return;
      }

      console.log('[WALLET] Step 1: Selecting Phantom wallet...');
      await select('Phantom' as WalletName);
      
      // STEP 2: Wait for selection to complete (250ms as specified)
      await new Promise(resolve => setTimeout(resolve, 250));
      console.log('[WALLET] Step 2: Selection wait complete');
      
      // STEP 3: Connect to wallet (no conditions, always runs)
      setHasAuthenticatedThisSession(false);
      console.log('[WALLET] Step 3: Connecting to wallet...');
      await connect();
      
      console.log('[WALLET] Step 4: Wallet connected successfully');

      // STEP 4: Wait for publicKey to be available (poll up to 10 times)
      let walletAddress: string | null = null;
      let attempts = 0;
      while (!walletAddress && attempts < 10) {
        if (publicKey) {
          walletAddress = publicKey.toBase58();
          break;
        }
        // Try to get from wallet adapter directly
        const currentPublicKey = wallet?.adapter?.publicKey;
        if (currentPublicKey) {
          walletAddress = currentPublicKey.toBase58();
          break;
        }
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }

      if (!walletAddress) {
        console.error('[WALLET] Failed to get wallet address after connection');
        setState((s) => ({
          ...s,
          loading: false,
          error: 'Failed to get wallet address. Please try again.',
        }));
        authenticatingRef.current = false;
        return;
      }

      console.log('[WALLET] Step 5: Wallet address obtained:', walletAddress);

      // STEP 5: Call backend to authenticate
      console.log('[AUTH] Step 6: Calling backend to authenticate wallet...');
      const result = await authenticateWallet(walletAddress);
      console.log('[AUTH] Step 7: Backend response received:', result);

      // STEP 6: Format and update auth state
      const authResponse: BackendAuthResponse = {
        success: result.success || false,
        authenticated: result.authenticated !== false,
        wallet: result.wallet || walletAddress,
        username: result.username || result.user?.username || undefined,
        needsUsername: result.needsUsername === true || result.needs_username === true,
        user: result.user || (result.username ? { wallet: walletAddress, username: result.username } : undefined),
      };

      console.log('[AUTH] Step 8: Updating auth state with:', authResponse);
      updateAuthState(authResponse);
      
      // Ensure loading is false
      setState((s) => ({ ...s, loading: false }));
      setHasAuthenticatedThisSession(true);
      
      console.log('[AUTH] Step 9: Authentication complete - session saved to localStorage');
    } catch (err: any) {
      // NEVER throw - always handle gracefully (no crashes, no Next.js error screen)
      console.error('[WALLET] Connection/Auth error:', cleanError(err));
      
      // Reset state on error (no throw, no crash)
      setState((s) => ({
        ...s,
        error: cleanError(err),
        isAuthenticated: false,
        loading: false,
        needsUsername: false,
        shouldShowUsernameModal: false,
      }));
      setHasAuthenticatedThisSession(false);
    } finally {
      // Always reset the guard
      authenticatingRef.current = false;
    }
  }, [connect, select, publicKey, wallet, cleanError, updateAuthState, authenticateWallet]);

  // Auto-auth when wallet becomes connected (only once per session)
  // But skip if we already have a restored session
  useEffect(() => {
    // If session was restored, don't auto-auth again unless wallet reconnects with different key
    if (sessionRestoredRef.current && state.isAuthenticated) {
      // Check if the connected wallet matches the restored session
      if (publicKey && publicKey.toBase58() === state.wallet) {
        // Wallet matches restored session, we're good
        return;
      }
    }

    // Normal auto-auth flow
    if (connected && publicKey && !hasAuthenticatedThisSession && !authenticatingRef.current) {
      void signInWithWallet();
    }
  }, [connected, publicKey, hasAuthenticatedThisSession, signInWithWallet, state.isAuthenticated, state.wallet]);

  // Track if wallet was ever connected this session (to detect active disconnect vs page load)
  useEffect(() => {
    if (connected) {
      wasConnectedRef.current = true;
    }
  }, [connected]);

  // Reset auth state on disconnect - but only if user actively disconnected (not page load)
  useEffect(() => {
    // If session was restored, NEVER clear it automatically
    // User is authenticated even if wallet isn't connected (Phantom doesn't auto-connect)
    if (sessionRestoredRef.current) {
      // Keep the session - user is authenticated even if wallet not connected
      // Only clear on explicit logout
      return;
    }

    // Only clear if wallet was connected and then disconnected (user actively disconnected)
    // AND we didn't restore a session
    if (!connected && wasConnectedRef.current && state.isAuthenticated && !sessionRestoredRef.current) {
      console.log('[AUTH] Wallet disconnected, clearing session');
      setState(initialState);
      setHasAuthenticatedThisSession(false);
      wasConnectedRef.current = false;
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(SESSION_KEY);
      }
    }
  }, [connected, state.isAuthenticated]);

  // Update username via backend
  // Uses wallet from state (persists) rather than requiring publicKey to be connected
  const setUsername = useCallback(
    async (username: string) => {
      // Use wallet from state (persists even if Phantom not actively connected)
      const walletAddress = state.wallet || (publicKey ? publicKey.toBase58() : null);
      
      if (!walletAddress) {
        throw new Error('Wallet address not available');
      }

      setState((s) => ({ ...s, loading: true, error: null }));

      try {
        console.log('[AUTH] Creating user with username:', username, 'wallet:', walletAddress);
        const result = await createUser(walletAddress, username);
        console.log('[AUTH] Backend response from create-user:', result);

        // Backend returns: { success, wallet, username, needsUsername: false }
        // Format response to match updateAuthState expectations
        const authResponse: BackendAuthResponse = {
          success: result.success || false,
          authenticated: result.authenticated !== false, // Default to true
          wallet: result.wallet || walletAddress,
          username: result.username || result.user?.username || username,
          needsUsername: false, // After creating username, needsUsername is always false
          user: result.user || { wallet: walletAddress, username: result.username || username },
        };

        console.log('[AUTH] Calling updateAuthState with:', authResponse);
        // ALWAYS call updateAuthState() to update global state
        updateAuthState(authResponse);
        
        // Ensure loading is false and modal closes
        setState((s) => ({
          ...s,
          loading: false,
          shouldShowUsernameModal: false,
        }));
        
        console.log('[AUTH] Username saved and state updated:', authResponse.username);
      } catch (error: any) {
        console.error('[AUTH] Error setting username:', cleanError(error));
        setState((s) => ({
          ...s,
          loading: false,
          error: 'Failed to set username. Please try again.',
        }));
        throw error;
      }
    },
    [state.wallet, publicKey, cleanError, updateAuthState]
  );

  // Disconnect - clears localStorage and resets state
  const logout = useCallback(async () => {
    try {
      console.log('[AUTH] Logging out...');
      
      // Disconnect wallet adapter
      try {
        await disconnect();
      } catch (err) {
        // Ignore disconnect errors - wallet might already be disconnected
        console.warn('[AUTH] Disconnect warning:', cleanError(err));
      }
      
      // Clear all state
      sessionRestoredRef.current = false;
      wasConnectedRef.current = false;
      authenticatingRef.current = false;
      setHasAuthenticatedThisSession(false);
      
      // Reset auth state
      setState({
        isAuthenticated: false,
        loading: false,
        error: null,
        user: null,
        username: null,
        wallet: null,
        needsUsername: false,
        shouldShowUsernameModal: false,
      });
      
      // Clear localStorage
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(SESSION_KEY);
        console.log('[AUTH] Session cleared from localStorage');
      }
      
      console.log('[AUTH] Logout complete');
    } catch (err) {
      console.error('[AUTH] Logout error:', cleanError(err));
      // Even if there's an error, clear the state
      sessionRestoredRef.current = false;
      wasConnectedRef.current = false;
      setHasAuthenticatedThisSession(false);
      setState(initialState);
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(SESSION_KEY);
      }
    }
  }, [disconnect, cleanError]);

  const walletPublicKey = publicKey ? publicKey.toBase58() : null;
  // Use session wallet if available, otherwise use connected wallet
  const displayWallet = state.wallet || walletPublicKey;

  // Memoize context value to prevent unnecessary re-renders
  const contextValue: AuthContextType = useMemo(
    () => ({
      ...state,
      walletPublicKey: displayWallet, // Use session wallet or connected wallet
      connectWalletAndSignIn,
      setUsername,
      logout,
      // Legacy compatibility
      user: state.user
        ? {
            id: state.user.wallet, // Use wallet as ID for compatibility
            wallet: state.user.wallet,
            username: state.user.username,
          }
        : null,
      wallet: displayWallet, // Use session wallet or connected wallet
      connected: connected && !!publicKey,
      hasUser: !!state.user,
      hasUsername: !!state.username,
      userUsername: state.username || undefined,
    }),
    [state, displayWallet, connectWalletAndSignIn, setUsername, logout, connected, publicKey]
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
