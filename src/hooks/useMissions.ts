// src/hooks/useMissions.ts — Paginated mission fetching hook
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { missionService } from '../services/missionService';
import { Mission, MissionListParams, PaginationMeta } from '../types';

interface UseMissionsReturn {
  missions: Mission[];
  pagination: PaginationMeta | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  loadMore: () => void;
  refresh: () => void;
  setParams: (p: MissionListParams) => void;
}

export function useMissions(initialParams: MissionListParams = {}): UseMissionsReturn {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [params, setParams] = useState<MissionListParams>({ page: 1, limit: 10, ...initialParams });

  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  const fetchMissions = useCallback(async (fetchParams: MissionListParams, append = false) => {
    if (!append) setIsLoading(true);
    setError(null);

    try {
      const data = await missionService.getMissions(fetchParams);
      if (!isMountedRef.current) return;

      if (append) {
        setMissions((prev) => [...prev, ...data.missions]);
      } else {
        setMissions(data.missions);
      }
      setPagination(data.pagination);
    } catch (err: any) {
      if (!isMountedRef.current) return;
      const msg = err.message ?? 'Gagal memuatkan misi.';
      setError(msg);
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  }, []);

  // Initial fetch and whenever params change (excluding page)
  useEffect(() => {
    fetchMissions({ ...params, page: 1 }, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.state, params.category, params.search]);

  const loadMore = useCallback(() => {
    if (!pagination) return;
    if (pagination.page >= pagination.totalPages) return;
    if (isLoading) return;

    const nextPage = pagination.page + 1;
    const nextParams = { ...params, page: nextPage };
    setParams(nextParams);
    fetchMissions(nextParams, true);
  }, [pagination, isLoading, params, fetchMissions]);

  const refresh = useCallback(() => {
    setIsRefreshing(true);
    const resetParams = { ...params, page: 1 };
    setParams(resetParams);
    fetchMissions(resetParams, false);
  }, [params, fetchMissions]);

  const updateParams = useCallback((p: MissionListParams) => {
    setParams({ page: 1, limit: 10, ...p });
    setMissions([]);
  }, []);

  return {
    missions,
    pagination,
    isLoading,
    isRefreshing,
    error,
    loadMore,
    refresh,
    setParams: updateParams,
  };
}
