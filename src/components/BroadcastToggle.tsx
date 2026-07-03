// src/components/BroadcastToggle.tsx — GPS broadcast on/off toggle card
import React, { useRef } from 'react';
import {
  View,
  Text,
  Switch,
  StyleSheet,
  Animated,
} from 'react-native';
import { Colors } from '../constants/colors';
import { BorderRadius, FontSize, FontWeight, Shadow, Spacing } from '../constants/theme';

interface Props {
  isTracking: boolean;
  onToggle: () => void;
  projectId?: string;
}

export const BroadcastToggle: React.FC<Props> = ({
  isTracking,
  onToggle,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    if (isTracking) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isTracking]);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Koordinasi Langsung</Text>
          <Text style={styles.subtitle}>
            Aktifkan GPS untuk berkongsi lokasi dengan pentadbir SAFM semasa misi aktif.
          </Text>
        </View>
        {isTracking && (
          <Animated.View
            style={[styles.liveDot, { transform: [{ scale: pulseAnim }] }]}
          />
        )}
      </View>

      <View style={styles.toggleRow}>
        <View style={styles.broadcastLabel}>
          <Text style={styles.broadcastText}>
            {isTracking ? '📡 Sedang Disiarkan' : '📡 Siar Lokasi'}
          </Text>
          {isTracking && (
            <Text style={styles.activeHint}>• Kemas kini setiap 15 saat</Text>
          )}
        </View>
        <Switch
          value={isTracking}
          onValueChange={onToggle}
          trackColor={{
            false: Colors.border,
            true: Colors.primaryLight,
          }}
          thumbColor={isTracking ? Colors.primary : Colors.white}
          ios_backgroundColor={Colors.border}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    ...Shadow.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  liveDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.white,
    opacity: 0.9,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.white,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.white,
    opacity: 0.85,
    maxWidth: '85%',
    lineHeight: 22,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  broadcastLabel: {
    flex: 1,
  },
  broadcastText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.white,
  },
  activeHint: {
    fontSize: FontSize.xs,
    color: Colors.white,
    opacity: 0.75,
    marginTop: 2,
  },
});
