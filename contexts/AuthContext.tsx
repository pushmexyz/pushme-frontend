'use client';

import React, { createContext, useContext, useCallback, useEffect, useState, useRef, useMemo } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { supabase } from '@/lib/supabaseClient';

type UserRow = {
  id: string;
  wallet: string;
  username: string | null;
  created_at: string;
  updated_at: string;
};

type AuthState = {
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  user: UserRow | null;
  hasUsername: boolean;
};

const initialState: AuthState = {
  isAuthenticated: false,
  loading: false,
  error: null,
  user: null,
  hasUsername: false,
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
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function getOrCreateUser(walletPublicKey: string): Promise<UserRow> {
  if (!supabase) {
    throw new Error('Database not configured. Please set up Supabase.');
  }

  // 1) Try to find existing user by wallet
  const { data: existing, error: selectError } = await supabase
    .from('users')
    .select('*')
    .eq('wallet', walletPublicKey)
    .maybeSingle<UserRow>();

  if (selectError && selectError.code !== 'PGRST116') {
    console.error('[AUTH] Error fetching user by wallet:', selectError);
    throw selectError;
  }

  if (existing) {
    console.log('[AUTH] Existing user found:', existing);
    return existing;
  }

  // 2) No user → insert new one
  const { data: inserted, error: insertError } = await supabase
    .from('users')
    .insert({ wallet: walletPublicKey })
    .select()
    .single<UserRow>();

  if (insertError) {
    console.error('[AUTH] Error inserting new user:', insertError);
    throw insertError;
  }

  console.log('[AUTH] New user created:', inserted);
  return inserted;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { publicKey, connected, connect, disconnect } = useWallet();
  const [state, setState] = useState<AuthState>(initialState);
  const [hasAuthenticatedThisSession, setHasAuthenticatedThisSession] = useState(false);
  const authenticatingRef = useRef(false);

  const signInWithWallet = useCallback(async () => {
    if (!publicKey) {
      console.warn('[AUTH] signInWithWallet called with no publicKey');
      return;
    }

    if (authenticatingRef.current) {
      console.log('[AUTH] Already authenticating, skipping...');
      return;
    }

    const walletAddress = publicKey.toBase58();

    try {
      authenticatingRef.current = true;
      setState((s) => ({ ...s, loading: true, error: null }));
      console.log('[AUTH] Authenticating wallet:', walletAddress);

      const user = await getOrCreateUser(walletAddress);

      const newState = {
        isAuthenticated: true,
        loading: false,
        error: null,
        user,
        hasUsername: !!user.username,
      };
      setState(newState);
      console.log('[AUTH] Authentication successful!');

      // Optionally persist in localStorage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('pressme_wallet', walletAddress);
        window.localStorage.setItem('pressme_user_id', user.id);
      }
      setHasAuthenticatedThisSession(true);
    } catch (err: any) {
      console.error('[AUTH] Authentication error:', err);
      setState((s) => ({
        ...s,
        loading: false,
        error: 'Failed to authenticate wallet. Please try again.',
        isAuthenticated: false,
        user: null,
        hasUsername: false,
      }));
    } finally {
      authenticatingRef.current = false;
    }
  }, [publicKey]);

  // Public method: connect wallet then sign in
  const connectWalletAndSignIn = useCallback(async () => {
    try {
      console.log('[WALLET] Starting connection...');
      await connect();
      console.log('[WALLET] Wallet connected.');
    } catch (err) {
      console.error('[AUTH] Wallet connect failed:', err);
      setState((s) => ({
        ...s,
        error: 'Wallet connection failed.',
        isAuthenticated: false,
      }));
    }
  }, [connect]);

  // Auto-auth when wallet becomes connected (only once per session)
  useEffect(() => {
    if (connected && publicKey && !hasAuthenticatedThisSession && !authenticatingRef.current) {
      console.log('[AUTH] Wallet connected, authenticating...');
      void signInWithWallet();
    }
  }, [connected, publicKey, hasAuthenticatedThisSession, signInWithWallet]);

  // Reset auth state on disconnect
  useEffect(() => {
    if (!connected && state.isAuthenticated) {
      console.log('[AUTH] Wallet disconnected.');
      setState(initialState);
      setHasAuthenticatedThisSession(false);
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('pressme_wallet');
        window.localStorage.removeItem('pressme_user_id');
      }
    }
  }, [connected, state.isAuthenticated]);

  // Update username
  const setUsername = useCallback(
    async (username: string) => {
      if (!state.user) {
        throw new Error('Not authenticated');
      }

      if (!supabase) {
        throw new Error('Database not configured');
      }

      setState((s) => ({ ...s, loading: true, error: null }));

      try {
        const { data, error } = await supabase
          .from('users')
          .update({ username })
          .eq('id', state.user.id)
          .select()
          .single<UserRow>();

        if (error || !data) {
          console.error('[AUTH] Error updating username:', error);
          setState((s) => ({
            ...s,
            loading: false,
            error: 'Failed to set username. Please try again.',
          }));
          throw new Error('Failed to set username. Please try again.');
        }

        setState((s) => ({
          ...s,
          loading: false,
          user: data,
          hasUsername: !!data.username,
        }));

        console.log('[AUTH] Username updated successfully');
      } catch (error) {
        console.error('[AUTH] Error setting username:', error);
        throw error;
      }
    },
    [state.user]
  );

  // Disconnect
  const logout = useCallback(async () => {
    try {
      await disconnect();
      console.log('[AUTH] Wallet disconnected.');
    } catch (err) {
      console.error('[AUTH] Error during disconnect:', err);
    } finally {
      setState(initialState);
      setHasAuthenticatedThisSession(false);
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('pressme_wallet');
        window.localStorage.removeItem('pressme_user_id');
      }
    }
  }, [disconnect]);

  const walletPublicKey = publicKey ? publicKey.toBase58() : null;

  // Memoize context value to prevent unnecessary re-renders
  const contextValue: AuthContextType = useMemo(
    () => ({
      ...state,
      walletPublicKey,
      connectWalletAndSignIn,
      setUsername,
      logout,
      // Legacy compatibility - map user to match old interface
      user: state.user
        ? {
            id: state.user.id,
            wallet: state.user.wallet,
            username: state.user.username,
          }
        : null,
      wallet: walletPublicKey,
      connected: connected && !!publicKey,
    }),
    [state, walletPublicKey, connectWalletAndSignIn, setUsername, logout, connected, publicKey]
  );

  // Debug logging when state changes
  useEffect(() => {
    console.log('[AUTH CONTEXT] State changed:', {
      isAuthenticated: state.isAuthenticated,
      hasUser: !!state.user,
      username: state.user?.username,
      walletPublicKey,
    });
  }, [state.isAuthenticated, state.user, walletPublicKey]);

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

