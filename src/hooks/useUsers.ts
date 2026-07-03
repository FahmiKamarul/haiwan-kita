import { useCallback, useEffect, useRef, useState } from 'react';
import { userService } from '../services/userService';
import { User } from '../types';

export function useUsers(role?: string) {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await userService.getUsersByRole(role);
      if (isMountedRef.current) {
        setUsers(data);
      }
    } catch (err: any) {
      if (isMountedRef.current) {
        setError(err.message ?? 'Gagal memuatkan pengguna.');
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [role]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return { users, isLoading, error, refresh: fetchUsers };
}
