// src/context/AuthContext.tsx
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { authService } from '../services/authService';
import { User, RegisterPayload } from '../types';
import { connectSocket, disconnectSocket, leaveUserRoom } from '../lib/socket';

// ─── Context shape ────────────────────────────────────────────────────────────

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  login: (email: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateProfile: (payload: { name?: string; phone?: string; skills?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ── Restore session from AsyncStorage on mount ─────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const tok = await AsyncStorage.getItem('token');
        const usr = await AsyncStorage.getItem('user');
        if (tok && usr) {
          setToken(tok);
          setUser(JSON.parse(usr));
          // Re-connect socket with stored token
          connectSocket(tok);
        }
      } catch (err) {
        console.error('[Auth] Failed to restore session:', err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // ── Persist helper ─────────────────────────────────────────────────────────
  const persistSession = useCallback(async (userData: User) => {
    const tok = userData.token;
    await AsyncStorage.setItem('token', tok);
    await AsyncStorage.setItem('user', JSON.stringify(userData));
    setToken(tok);
    setUser(userData);
    connectSocket(tok);
  }, []);

  // ── Login ──────────────────────────────────────────────────────────────────
  const login = useCallback(
    async (email: string, password: string) => {
      const userData = await authService.login(email, password);
      await persistSession(userData);
    },
    [persistSession]
  );

  // ── Register ───────────────────────────────────────────────────────────────
  const register = useCallback(
    async (payload: RegisterPayload): Promise<User> => {
      const userData = await authService.register(payload);
      await persistSession(userData);
      return userData;
    },
    [persistSession]
  );

  // ── Logout ─────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    if (user?.id) leaveUserRoom(user.id);
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    disconnectSocket();
    setToken(null);
    setUser(null);
  }, [user]);

  // ── Pay Membership ─────────────────────────────────────────────────────────
  const payMembership = useCallback(async () => {
    const result = await authService.payMembership();
    // Refresh user profile to get updated paymentStatus
    const updated = await authService.getMe();
    // Merge token back (getMe doesn't return it)
    const merged: User = { ...updated, token: token! };
    await AsyncStorage.setItem('user', JSON.stringify(merged));
    setUser(merged);
    Alert.alert('Pembayaran Berjaya! 🎉', result.message);
  }, [token]);

  // ── Refresh user from API ─────────────────────────────────────────────────
  const refreshUser = useCallback(async () => {
    if (!token) return;
    const updated = await authService.getMe();
    const merged: User = { ...updated, token };
    await AsyncStorage.setItem('user', JSON.stringify(merged));
    setUser(merged);
  }, [token]);

  // ── Update Profile ────────────────────────────────────────────────────────
  const updateProfile = useCallback(async (payload: { name?: string; phone?: string; skills?: string }) => {
    if (!token) return;
    const updated = await authService.updateProfile(payload);
    const merged: User = { ...updated, token };
    await AsyncStorage.setItem('user', JSON.stringify(merged));
    setUser(merged);
  }, [token]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isLoading,
      isAuthenticated: !!token,
      login,
      register,
      logout,
      payMembership,
      refreshUser,
      updateProfile,
    }),
    [user, token, isLoading, login, register, logout, payMembership, refreshUser, updateProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within <AuthProvider>');
  }
  return ctx;
}
