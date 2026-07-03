// src/screens/member/MemberDashboard.tsx — Rajah 3.21
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../../context/AuthContext';
import { useMissions } from '../../hooks/useMissions';
import { MemberStackParamList } from '../../types';
import { Colors } from '../../constants/colors';
import { BorderRadius, FontSize, FontWeight, Shadow, Spacing } from '../../constants/theme';
import { Avatar } from '../../components/Avatar';

type Nav = StackNavigationProp<MemberStackParamList>;

const STATE_BADGE: Record<string, { label: string; color: string; bg: string }> = {
  ACTIVE: { label: 'AKTIF', color: Colors.success, bg: Colors.successLight },
  UPCOMING: { label: 'AKAN DATANG', color: Colors.info, bg: Colors.infoLight },
  PENDING: { label: 'MENUNGGU KELULUSAN', color: Colors.warning, bg: Colors.warningLight },
  COMPLETED: { label: 'SELESAI', color: Colors.textMuted, bg: Colors.borderLight },
  CANCELLED: { label: 'DIBATALKAN', color: Colors.danger, bg: Colors.dangerLight },
};

export function MemberDashboard() {
  const { user } = useAuth();
  const navigation = useNavigation<Nav>();

  const { missions, isLoading, isRefreshing, refresh } = useMissions({ limit: 5, state: 'UPCOMING,ACTIVE' });

  const memberProfile = user?.memberProfile;
  const isActive = memberProfile?.paymentStatus === 'PAID';

  const expiryDate = memberProfile?.membershipExpiry
    ? new Date(memberProfile.membershipExpiry).toLocaleDateString('ms-MY', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : 'Tidak Diketahui';

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
      >
        {/* Top Bar */}
        <View style={styles.topBar}>
          <View>
            <Text style={styles.appName}>Haiwan Kita</Text>
            <Text style={styles.portal}>Portal Ahli</Text>
          </View>
          <View style={styles.topRight}>
            <Text style={styles.userName}>{user?.name ?? '—'}</Text>
            <Avatar name={user?.name ?? 'U'} size={38} />
          </View>
        </View>

        <View style={styles.content}>
          {/* Membership Card */}
          <View style={[styles.memberCard, isActive && styles.memberCardActive]}>
            <View style={styles.memberCardHeader}>
              <View>
                <Text style={styles.memberCardTitle}>KEAHLIAN TAHUNAN</Text>
                <View style={styles.statusRow}>
                  <Text style={styles.statusLabel}>Status: </Text>
                  <Text style={[styles.statusValue, { color: isActive ? Colors.success : Colors.warning }]}>
                    {isActive ? '● AKTIF' : '● MENUNGGU PEMBAYARAN'}
                  </Text>
                </View>
                {isActive && (
                  <Text style={styles.expiry}>Sah sehingga {expiryDate}</Text>
                )}
              </View>
              <View style={styles.memberIconBox}>
                <Text style={{ fontSize: 28 }}>🏅</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.renewBtn}>
              <Text style={styles.renewBtnText}>Renew Keahlian ›</Text>
            </TouchableOpacity>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => navigation.navigate('ProposeMission')}
            >
              <Text style={styles.actionIcon}>➕</Text>
              <Text style={styles.actionLabel}>Projek Baru</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn}>
              <Text style={styles.actionIcon}>👥</Text>
              <Text style={styles.actionLabel}>Sukarelawan</Text>
            </TouchableOpacity>
          </View>

          {/* Managed Missions */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Misi Diuruskan</Text>
            <TouchableOpacity>
              <Text style={styles.viewAll}>Lihat Semua</Text>
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <ActivityIndicator color={Colors.primary} style={{ marginVertical: Spacing.lg }} />
          ) : missions.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>Tiada misi untuk diuruskan.</Text>
            </View>
          ) : (
            missions.slice(0, 4).map((mission) => {
              const badge = STATE_BADGE[mission.state] ?? STATE_BADGE.UPCOMING;
              return (
                <TouchableOpacity
                  key={mission.id}
                  style={styles.missionRow}
                  activeOpacity={0.8}
                  onPress={() =>
                    navigation.navigate('MissionDetail', { missionId: mission.id })
                  }
                >
                  <View style={styles.missionInfo}>
                    <Text style={styles.missionTitle} numberOfLines={1}>
                      {mission.title}
                    </Text>
                    <Text style={styles.missionMeta}>
                      📅 {new Date(mission.startDate).toLocaleDateString('ms-MY', { day: '2-digit', month: 'short', year: 'numeric' })}
                      {'  '}• {mission.currentParticipants} Daftar
                    </Text>
                    <View style={[styles.stateBadge, { backgroundColor: badge.bg }]}>
                      <Text style={[styles.stateBadgeText, { color: badge.color }]}>
                        {badge.label}
                      </Text>
                    </View>
                  </View>

                  {mission.state === 'ACTIVE' ? (
                    <TouchableOpacity
                      style={styles.attendanceBtn}
                      onPress={(e) => {
                        e.stopPropagation?.();
                        navigation.navigate('MarkAttendance', {
                          missionId: mission.id,
                          missionTitle: mission.title,
                        });
                      }}
                    >
                      <Text style={styles.attendanceBtnText}>Kehadiran</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.waitTag}>
                      <Text style={styles.waitTagText}>Tunggu</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  appName: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.extrabold,
    color: Colors.primary,
  },
  portal: { fontSize: FontSize.xs, color: Colors.textSecondary },
  topRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  userName: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  content: { padding: Spacing.md },
  memberCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.border,
    ...Shadow.sm,
  },
  memberCardActive: {
    borderColor: Colors.success + '60',
    backgroundColor: Colors.successLight + '80',
  },
  memberCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  memberCardTitle: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.textMuted,
    letterSpacing: 0.8,
  },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  statusLabel: { fontSize: FontSize.sm, color: Colors.textSecondary },
  statusValue: { fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  expiry: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 4 },
  memberIconBox: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  renewBtn: { alignSelf: 'flex-start' },
  renewBtnText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.primary,
  },
  quickActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    gap: 6,
    ...Shadow.sm,
  },
  actionIcon: { fontSize: 24 },
  actionLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  viewAll: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: FontWeight.semibold,
  },
  emptyCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    ...Shadow.sm,
  },
  emptyText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  missionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadow.sm,
  },
  missionInfo: { flex: 1 },
  missionTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: 3,
  },
  missionMeta: { fontSize: FontSize.xs, color: Colors.textSecondary, marginBottom: 6 },
  stateBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  stateBadgeText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold },
  attendanceBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginLeft: Spacing.sm,
  },
  attendanceBtnText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.white,
  },
  waitTag: {
    borderRadius: BorderRadius.md,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: Colors.border,
    marginLeft: Spacing.sm,
  },
  waitTagText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: Colors.textMuted },
});
