// src/lib/api.ts — Axios instance with JWT interceptors
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Resolve API base URL:
//  1. app.json extra.API_BASE_URL  (set per-environment)
//  2. Platform fallback: localhost for web, 10.0.2.2 for Android emulator
const _extra = Constants.expoConfig?.extra ?? {};
const API_BASE_URL: string =
  _extra.API_BASE_URL ?? 'https://kapkap.me';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Request Interceptor ─────────────────────────────────────────────────────
// Attach JWT token to every request automatically
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Navigation ref for redirecting on 401 — set by RootNavigator
let _navigateToLogin: (() => void) | null = null;

export function setNavigateToLogin(fn: () => void) {
  _navigateToLogin = fn;
}

// ─── Response Interceptor ────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status: number = error.response?.status;
    const message: string =
      error.response?.data?.message ?? 'Ralat tidak dijangka. Sila cuba lagi.';
    const details: Record<string, string[]> | undefined =
      error.response?.data?.details;

    if (status === 401) {
      // Token expired or invalid — clear and redirect to login
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      _navigateToLogin?.();
    }

    if (status === 429) {
      console.warn('[API] Rate limit hit — 429 Too Many Requests');
    }

    // Normalize rejection shape
    return Promise.reject({ status, message, details });
  }
);

export default api;
