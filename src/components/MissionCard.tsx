// src/components/MissionCard.tsx
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Mission } from '../types';
import { Colors, CategoryColors } from '../constants/colors';
import { BorderRadius, FontSize, FontWeight, Shadow, Spacing } from '../constants/theme';

interface Props {
  mission: Mission;
  onPress?: () => void;
  onJoin?: () => void;
  isJoining?: boolean;
  showJoinButton?: boolean;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ms-MY', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export const MissionCard: React.FC<Props> = ({
  mission,
  onPress,
  onJoin,
  isJoining = false,
  showJoinButton = true,
}) => {
  const catColor = CategoryColors[mission.category] ?? Colors.catOther;
  const categoryLabel = mission.category.charAt(0) + mission.category.slice(1).toLowerCase();

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.row}>
        {/* Icon placeholder — animal icon by category */}
        <View style={[styles.iconBox, { backgroundColor: catColor + '20' }]}>
          <Text style={{ fontSize: 22 }}>
            {categoryEmoji(mission.category)}
          </Text>
        </View>

        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>
            {mission.title}
          </Text>
          <View style={styles.metaRow}>
            <Text style={styles.metaIcon}>📅</Text>
            <Text style={styles.meta}>
              {formatDate(mission.startDate)}
            </Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaIcon}>📍</Text>
            <Text style={styles.meta} numberOfLines={1}>
              {mission.location}
            </Text>
          </View>
        </View>

        {showJoinButton && (
          <View style={styles.joinArea}>
            {mission.isFull ? (
              <View style={styles.fullBadge}>
                <Text style={styles.fullText}>PENUH</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={[
                  styles.joinBtn,
                  isJoining && styles.joinBtnDisabled,
                ]}
                onPress={onJoin}
                disabled={isJoining}
              >
                {isJoining ? (
                  <ActivityIndicator size="small" color={Colors.white} />
                ) : (
                  <Text style={styles.joinBtnText}>SERTAI</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* Category pill */}
      <View style={[styles.catPill, { backgroundColor: catColor + '18' }]}>
        <View style={[styles.catDot, { backgroundColor: catColor }]} />
        <Text style={[styles.catText, { color: catColor }]}>
          {categoryLabel}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

function categoryEmoji(cat: string): string {
  const map: Record<string, string> = {
    RESCUE: '🐾',
    ADOPTION: '🏠',
    MEDICAL: '💉',
    AWARENESS: '📢',
    FEEDING: '🍖',
    OTHER: '🐶',
  };
  return map[cat] ?? '🐾';
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.cardBg,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadow.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  metaIcon: {
    fontSize: 11,
    marginRight: 4,
  },
  meta: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    flex: 1,
  },
  joinArea: {
    marginLeft: Spacing.sm,
  },
  joinBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 14,
    paddingVertical: 8,
    minWidth: 70,
    alignItems: 'center',
  },
  joinBtnDisabled: {
    opacity: 0.7,
  },
  joinBtnText: {
    color: Colors.white,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },
  fullBadge: {
    backgroundColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 70,
    alignItems: 'center',
  },
  fullText: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },
  catPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: Spacing.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  catDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  catText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },
});
