// src/components/IdBadge.tsx — Human-readable ID badge component
//
// Displays prefixed IDs (USR-00001, PRJ-00024) as stylish, color-coded
// badges in admin and detail views.
//
// Usage:
//   <IdBadge id="USR-00001" />
//   <IdBadge id="PRJ-00024" size="lg" />
//   <IdBadge id="ATT-00142" variant="outline" />
import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Colors } from '../constants/colors';
import { BorderRadius, FontSize, FontWeight, Spacing } from '../constants/theme';
// ── Prefix-to-style mapping ────────────────────────────────────
interface PrefixConfig {
  label: string;
  bgColor: string;
  textColor: string;
  icon: string;
}
const PREFIX_MAP: Record<string, PrefixConfig> = {
  USR: {
    label: 'User',
    bgColor: '#EFF6FF',      // soft blue
    textColor: '#2563EB',
    icon: '👤',
  },
  PRJ: {
    label: 'Project',
    bgColor: '#FEF3EB',      // SAFM orange tint
    textColor: '#EA6C0A',
    icon: '📋',
  },
  ATT: {
    label: 'Attendance',
    bgColor: '#DCFCE7',      // soft green
    textColor: '#16A34A',
    icon: '✅',
  },
  LOC: {
    label: 'Location',
    bgColor: '#FEF3C7',      // soft amber
    textColor: '#D97706',
    icon: '📍',
  },
  PTP: {
    label: 'Participant',
    bgColor: '#EDE9FE',      // soft violet
    textColor: '#7C3AED',
    icon: '🤝',
  },
  MBP: {
    label: 'Member',
    bgColor: '#FCE7F3',      // soft pink
    textColor: '#DB2777',
    icon: '💳',
  },
  VLP: {
    label: 'Volunteer',
    bgColor: '#CCFBF1',      // soft teal
    textColor: '#0D9488',
    icon: '🙋',
  },
  ADP: {
    label: 'Admin',
    bgColor: '#FEE2E2',      // soft red
    textColor: '#DC2626',
    icon: '🛡️',
  },
};
const DEFAULT_CONFIG: PrefixConfig = {
  label: 'Record',
  bgColor: Colors.borderLight,
  textColor: Colors.textSecondary,
  icon: '🏷️',
};
// ── Component Props ─────────────────────────────────────────────
type BadgeSize = 'sm' | 'md' | 'lg';
type BadgeVariant = 'filled' | 'outline' | 'ghost';
interface IdBadgeProps {
  /** The full prefixed ID string (e.g., "USR-00001") */
  id: string;
  /** Display size: 'sm' (inline), 'md' (default), 'lg' (prominent) */
  size?: BadgeSize;
  /** Visual variant: 'filled' (default), 'outline', 'ghost' */
  variant?: BadgeVariant;
  /** Show the emoji icon before the ID */
  showIcon?: boolean;
  /** Additional styles for the container */
  style?: ViewStyle;
  /** Show only the prefix part (e.g., "USR" instead of "USR-00001") */
  prefixOnly?: boolean;
  /** Whether to render with monospace-style font */
  mono?: boolean;
}
// ── Component ───────────────────────────────────────────────────
export const IdBadge: React.FC<IdBadgeProps> = ({
  id,
  size = 'md',
  variant = 'filled',
  showIcon = false,
  style,
  prefixOnly = false,
  mono = true,
}) => {
  const prefix = id.split('-')[0] ?? '';
  const config = PREFIX_MAP[prefix] ?? DEFAULT_CONFIG;
  const displayText = prefixOnly ? prefix : id;
  // Build dynamic styles based on size and variant
  const containerStyle: ViewStyle[] = [
    styles.base,
    sizeStyles[size],
    getVariantStyle(variant, config),
    style as ViewStyle,
  ];
  const textStyle: any[] = [
    styles.text,
    textSizeStyles[size],
    { color: config.textColor },
    mono ? styles.mono : null,
  ];
  return (
    <View style={containerStyle}>
      {showIcon && <Text style={styles.icon}>{config.icon}</Text>}
      <Text style={textStyle} numberOfLines={1}>
        {displayText}
      </Text>
    </View>
  );
};
// ── Variant Helpers ─────────────────────────────────────────────
function getVariantStyle(variant: BadgeVariant, config: PrefixConfig): ViewStyle {
  switch (variant) {
    case 'filled':
      return {
        backgroundColor: config.bgColor,
        borderWidth: 0,
      };
    case 'outline':
      return {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: config.textColor + '40',
      };
    case 'ghost':
      return {
        backgroundColor: 'transparent',
        borderWidth: 0,
      };
  }
}
// ── Styles ──────────────────────────────────────────────────────
const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: BorderRadius.sm,
  },
  text: {
    fontWeight: FontWeight.semibold,
    letterSpacing: 0.8,
  },
  mono: {
    fontFamily: 'monospace',
    // On iOS you might use 'Menlo' or 'Courier', on Android 'monospace' works
  },
  icon: {
    marginRight: 4,
    fontSize: FontSize.xs,
  },
});
const sizeStyles: Record<BadgeSize, ViewStyle> = {
  sm: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  md: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  lg: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.md,
  },
};
const textSizeStyles: Record<BadgeSize, TextStyle> = {
  sm: { fontSize: FontSize.xs },
  md: { fontSize: FontSize.xs },
  lg: { fontSize: FontSize.sm },
};
export default IdBadge;
