// src/screens/admin/AdminMapScreen.tsx — Live GPS map with Socket.io
// react-native-maps is aliased to a web stub via metro.config.js — safe on all platforms
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { connectSocket, joinAdminRoom } from '../../lib/socket';
import { getGlobalLatestLocations } from '../../services/locationService';
import { useAuth } from '../../context/AuthContext';
import { Colors } from '../../constants/colors';
import { BorderRadius, FontSize, FontWeight, Shadow, Spacing } from '../../constants/theme';

interface LiveLocation {
  locationId: string;
  userId: string;
  name?: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  isStreaming: boolean;
  timestamp: string;
}

const INITIAL_REGION = {
  latitude: 3.8077,
  longitude: 109.4565,
  latitudeDelta: 8,
  longitudeDelta: 8,
};

export function AdminMapScreen() {
  const { token } = useAuth();
  const mapRef = useRef<any>(null);
  const [streamers, setStreamers] = useState<Record<string, LiveLocation>>({});
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!token) return;

    // Fetch initial locations
    getGlobalLatestLocations().then((res) => {
      const initial: Record<string, LiveLocation> = {};
      res.streamers.forEach((s: any) => {
        initial[s.userId] = s;
      });
      setStreamers(initial);
    }).catch(err => console.warn('[AdminMap] Failed to fetch initial locations:', err));

    const socket = connectSocket(token);
    joinAdminRoom();
    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));
    socket.on('locationUpdate', (payload: LiveLocation) => {
      setStreamers((prev) => ({ ...prev, [payload.userId]: payload }));
    });
    return () => { socket.off('locationUpdate'); };
  }, [token]);

  const allStreamers = Object.values(streamers);
  const activeStreamers = allStreamers.filter((s) => s.isStreaming);

  const fitToStreamers = () => {
    if (allStreamers.length === 0 || !mapRef.current) return;
    mapRef.current.fitToCoordinates(
      allStreamers.map((s) => ({ latitude: s.latitude, longitude: s.longitude })),
      { edgePadding: { top: 60, right: 60, bottom: 60, left: 60 }, animated: true }
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Penjejakan Langsung</Text>
          <Text style={styles.subtitle}>
            {activeStreamers.length} sukarelawan aktif di lapangan
          </Text>
        </View>
        <View style={[styles.connBadge, isConnected ? styles.connBadgeOn : styles.connBadgeOff]}>
          <View style={[styles.connDot, { backgroundColor: isConnected ? Colors.success : Colors.danger }]} />
          <Text style={styles.connText}>{isConnected ? 'Disambungkan' : 'Terputus'}</Text>
        </View>
      </View>

      {/* Map — on web the metro alias renders a friendly placeholder */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_DEFAULT}
          initialRegion={INITIAL_REGION}
          showsUserLocation={Platform.OS !== 'web'}
          showsMyLocationButton={false}
        >
          {allStreamers.map((streamer) => (
            <Marker
              key={streamer.userId}
              coordinate={{ latitude: streamer.latitude, longitude: streamer.longitude }}
              title={streamer.name ?? `Sukarelawan ${streamer.userId.slice(0, 6)}`}
              description={`${streamer.isStreaming ? 'Aktif' : 'Lokasi Terakhir'} - Dikemas kini: ${new Date(streamer.timestamp).toLocaleTimeString('en-MY')}`}
              pinColor={streamer.isStreaming ? Colors.success : Colors.danger}
            />
          ))}
        </MapView>

        {allStreamers.length > 0 && (
          <TouchableOpacity style={styles.fitBtn} onPress={fitToStreamers}>
            <Text style={styles.fitBtnText}>🎯 Fokus Semua</Text>
          </TouchableOpacity>
        )}

        {allStreamers.length === 0 && (
          <View style={styles.emptyOverlay}>
            <Text style={{ fontSize: 40 }}>📡</Text>
            <Text style={styles.emptyTitle}>Tiada Penstriman Aktif</Text>
            <Text style={styles.emptyBody}>
              Sukarelawan akan muncul di sini apabila mereka mengaktifkan GPS semasa misi.
            </Text>
          </View>
        )}
      </View>

      {/* Streamer list */}
      {allStreamers.length > 0 && (
        <View style={styles.streamerList}>
          <Text style={styles.streamerListTitle}>Senarai Sukarelawan</Text>
          {allStreamers.map((s) => (
            <View key={s.userId} style={styles.streamerRow}>
              <View style={[styles.streamerDot, { backgroundColor: s.isStreaming ? Colors.success : Colors.danger }]} />
              <Text style={styles.streamerName}>
                {s.name ?? `Pengguna ${s.userId.slice(0, 6)}`}
              </Text>
              <Text style={styles.streamerTime}>
                {new Date(s.timestamp).toLocaleTimeString('en-MY', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
          ))}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  subtitle: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  connBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
  },
  connBadgeOn: { backgroundColor: Colors.successLight },
  connBadgeOff: { backgroundColor: Colors.dangerLight },
  connDot: { width: 7, height: 7, borderRadius: 4, marginRight: 5 },
  connText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  mapContainer: { flex: 1, position: 'relative' },
  map: { flex: 1 },
  fitBtn: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: Colors.white,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: BorderRadius.full,
    ...Shadow.md,
  },
  fitBtnText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.primary },
  emptyOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(245,247,250,0.88)',
    padding: Spacing.xl,
    gap: Spacing.sm,
  },
  emptyTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  emptyBody: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  streamerList: {
    backgroundColor: Colors.white,
    padding: Spacing.md,
    maxHeight: 160,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  streamerListTitle: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
  },
  streamerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  streamerDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.success, marginRight: 8 },
  streamerName: { flex: 1, fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.textPrimary },
  streamerTime: { fontSize: FontSize.xs, color: Colors.textMuted },
});
