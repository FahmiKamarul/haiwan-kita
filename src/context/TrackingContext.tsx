// src/context/TrackingContext.tsx — GPS tracking state management
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { Alert } from 'react-native';
import {
  startGpsTracking,
  stopGpsTracking,
} from '../services/locationService';

interface TrackingContextValue {
  isTracking: boolean;
  activeProjectId: string | null;
  startTracking: (projectId: string) => Promise<void>;
  stopTracking: () => Promise<void>;
  toggleTracking: (projectId: string) => Promise<void>;
}

const TrackingContext = createContext<TrackingContextValue | null>(null);

export function TrackingProvider({ children }: { children: React.ReactNode }) {
  const [isTracking, setIsTracking] = useState(false);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

  const startTracking = useCallback(async (projectId: string) => {
    const ok = await startGpsTracking(projectId);
    if (ok) {
      setIsTracking(true);
      setActiveProjectId(projectId);
    } else {
      Alert.alert(
        'Kebenaran Diperlukan',
        'Sila benarkan akses lokasi untuk berkongsi GPS semasa misi.'
      );
    }
  }, []);

  const stopTracking = useCallback(async () => {
    if (activeProjectId) {
      await stopGpsTracking(activeProjectId);
    }
    setIsTracking(false);
    setActiveProjectId(null);
  }, [activeProjectId]);

  const toggleTracking = useCallback(
    async (projectId: string) => {
      if (isTracking && activeProjectId === projectId) {
        await stopTracking();
      } else {
        if (isTracking && activeProjectId) {
          await stopTracking();
        }
        await startTracking(projectId);
      }
    },
    [isTracking, activeProjectId, startTracking, stopTracking]
  );

  const value = useMemo<TrackingContextValue>(
    () => ({
      isTracking,
      activeProjectId,
      startTracking,
      stopTracking,
      toggleTracking,
    }),
    [isTracking, activeProjectId, startTracking, stopTracking, toggleTracking]
  );

  return (
    <TrackingContext.Provider value={value}>
      {children}
    </TrackingContext.Provider>
  );
}

export function useTracking(): TrackingContextValue {
  const ctx = useContext(TrackingContext);
  if (!ctx) {
    throw new Error('useTracking must be used within <TrackingProvider>');
  }
  return ctx;
}
