// src/services/locationService.ts
import * as Location from 'expo-location';
import api from '../lib/api';

let locationWatcher: Location.LocationSubscription | null = null;

/**
 * Request device location permissions (call once on app start / before tracking)
 */
export async function requestLocationPermission(): Promise<boolean> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === 'granted';
}

/**
 * Start watching GPS location based on distance interval and posting to API.
 * Automatically requests permission if not already granted.
 */
export async function startGpsTracking(projectId: string): Promise<boolean> {
  const granted = await requestLocationPermission();
  if (!granted) return false;

  if (locationWatcher) {
    locationWatcher.remove();
  }

  // Immediate first ping
  await sendLocationPing(projectId, true);

  locationWatcher = await Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.Balanced,
      distanceInterval: 10, // ONLY send data if they moved 10 meters
      timeInterval: 30000,  // OR if 30 seconds have passed (fallback)
    },
    (loc) => {
      api.post('/api/v1/location/update', {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        accuracy: loc.coords.accuracy,
        altitude: loc.coords.altitude,
        speed: loc.coords.speed,
        projectId,
        isStreaming: true,
      }).catch(err => console.warn('[GPS] Background ping failed:', err));
    }
  );

  return true;
}

/**
 * Stop GPS polling and send a final "stopped" ping.
 */
export async function stopGpsTracking(projectId: string): Promise<void> {
  if (locationWatcher) {
    locationWatcher.remove();
    locationWatcher = null;
  }
  // Final ping — marks user as no longer streaming
  try {
    const loc = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    await api.post('/api/v1/location/update', {
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
      accuracy: loc.coords.accuracy,
      altitude: loc.coords.altitude,
      speed: loc.coords.speed,
      projectId,
      isStreaming: false,
    });
  } catch (err) {
    console.warn('[GPS] Failed to send stop ping:', err);
  }
}

/** Whether a tracking interval is currently active */
export function isTrackingActive(): boolean {
  return locationWatcher !== null;
}

async function sendLocationPing(projectId: string, isStreaming: boolean): Promise<void> {
  try {
    const loc = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
    await api.post('/api/v1/location/update', {
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
      accuracy: loc.coords.accuracy,
      altitude: loc.coords.altitude,
      speed: loc.coords.speed,
      projectId,
      isStreaming,
    });
  } catch (err) {
    console.warn('[GPS] Ping failed:', err);
  }
}

/**
 * GET /api/v1/location/history — own location history
 */
export async function getLocationHistory(
  projectId?: string,
  limit = 50
): Promise<unknown[]> {
  const res = await api.get('/api/v1/location/history', {
    params: { ...(projectId && { projectId }), limit },
  });
  return res.data.data;
}

export async function getProjectStreamers(projectId: string): Promise<{
  streamers: unknown[];
  count: number;
}> {
  const res = await api.get(`/api/v1/location/project/${projectId}/streamers`);
  return res.data.data;
}

/**
 * GET /api/v1/location/latest — ADMIN only
 */
export async function getGlobalLatestLocations(): Promise<{
  streamers: unknown[];
  count: number;
}> {
  const res = await api.get('/api/v1/location/latest');
  return res.data.data;
}
