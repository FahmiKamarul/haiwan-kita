// src/hooks/useSejarah.ts
// Live-updating hook for the volunteer's mission history (Sejarah tab).
// Joins the user's personal Socket.io room and re-fetches whenever the
// server emits a `sejarah:updated` event — no polling required.
import { useCallback, useEffect, useRef, useState } from 'react';
import { missionService } from '../services/missionService';
import { getSocket, joinUserRoom, leaveUserRoom } from '../lib/socket';
import { Mission } from '../types';
interface SejarahPayload {
  event:
    | 'joined'
    | 'left'
    | 'mission_state_changed'
    | 'attendance_verified'
    | 'certificate_ready'
    | 'certificate_failed';
  projectId: string;
  projectTitle?: string;
  newState?: string;
  certificateUrl?: string;
  timestamp: string;
}
interface UseSejarahReturn {
  missions: Mission[];
  isLoading: boolean;
  lastEvent: SejarahPayload | null;
  refresh: () => void;
}
export function useSejarah(userId: string | undefined): UseSejarahReturn {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastEvent, setLastEvent] = useState<SejarahPayload | null>(null);
  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);
  const fetchMissions = useCallback(async () => {
    if (!isMountedRef.current) return;
    setIsLoading(true);
    try {
      const data = await missionService.getMyMissions();
      if (isMountedRef.current) setMissions(data);
    } catch {
      // history is non-critical — silently ignore
    } finally {
      if (isMountedRef.current) setIsLoading(false);
    }
  }, []);
  useEffect(() => {
    if (!userId) return;
    // 1. Initial load
    fetchMissions();
    // 2. Join the personal user room so the server can push events here
    joinUserRoom(userId);
    // 3. Listen for any sejarah change and re-fetch
    const socket = getSocket();
    const handler = (payload: SejarahPayload) => {
      setLastEvent(payload);
      fetchMissions();
    };
    socket?.on('sejarah:updated', handler);
    // 4. Handle the case where the socket connects *after* this effect runs
    //    (e.g. slow network on app launch) — re-join the room on reconnect
    const onReconnect = () => joinUserRoom(userId);
    socket?.on('connect', onReconnect);
    return () => {
      socket?.off('sejarah:updated', handler);
      socket?.off('connect', onReconnect);
      leaveUserRoom(userId);
    };
  }, [userId, fetchMissions]);
  return { missions, isLoading, lastEvent, refresh: fetchMissions };
}