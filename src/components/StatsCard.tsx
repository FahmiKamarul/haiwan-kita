// src/components/StatsCard.tsx — Summary stats card (projects, certs)
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { BorderRadius, FontSize, FontWeight, Shadow, Spacing } from '../constants/theme';

interface Props {
  value: string | number;
  label: string;
  accent?: string;
}

export const StatsCard: React.FC<Props> = ({
  value,
  label,
  accent = Colors.primary,
}) => (
  <View style={styles.card}>
    <Text style={[styles.value, { color: accent }]}>{String(value).padStart(2, '0')}</Text>
    <Text style={styles.label}>{label.toUpperCase()}</Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: Colors.cardBg,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    ...Shadow.sm,
  },
  value: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.extrabold,
    lineHeight: 42,
  },
  label: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.textMuted,
    letterSpacing: 1,
    marginTop: 4,
  },
});
