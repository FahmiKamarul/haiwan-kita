import api from '../lib/api';
import { User } from '../types';

export const userService = {
  async getUsersByRole(role?: string): Promise<User[]> {
    const params = role ? { role } : {};
    const res = await api.get('/api/v1/users', { params });
    return res.data.data as User[];
  },
};
