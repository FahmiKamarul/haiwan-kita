// src/services/authService.ts
import api from '../lib/api';
import { User, RegisterPayload } from '../types';

export const authService = {
  /**
   * POST /auth/login
   */
  async login(email: string, password: string): Promise<User> {
    const res = await api.post('/auth/login', { email, password });
    return res.data.data as User;
  },

  /**
   * POST /auth/register
   */
  async register(payload: RegisterPayload): Promise<User> {
    const res = await api.post('/auth/register', payload);
    return res.data.data as User;
  },

  /**
   * GET /auth/me — returns current authenticated user
   */
  async getMe(): Promise<User> {
    const res = await api.get('/auth/me');
    return res.data.data as User;
  },

  /**
   * POST /auth/create-payment-intent — fetches Stripe client secret for membership payment
   */
  async createPaymentIntent(): Promise<{
    clientSecret: string;
    amount: number;
  }> {
    const res = await api.post('/auth/create-payment-intent');
    return res.data.data;
  },

  /**
   * PUT /auth/profile — updates name, phone, and optional skills
   */
  async updateProfile(payload: { name?: string; phone?: string; skills?: string }): Promise<User> {
    const res = await api.put('/auth/profile', payload);
    return res.data.data as User;
  },

  /**
   * PUT /auth/password — updates user's password
   */
  async updatePassword(payload: { currentPassword?: string; newPassword?: string }): Promise<{ message: string }> {
    const res = await api.put('/auth/password', payload);
    return res.data.data;
  },
};
