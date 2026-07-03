import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../../context/AuthContext';
import { useTracking } from '../../context/TrackingContext';
import { useMissions } from '../../hooks/useMissions';
import { useSejarah } from '../../hooks/useSejarah';
import { MissionCard } from '../../components/MissionCard';
import { BroadcastToggle } from '../../components/BroadcastToggle';
import { StatsCard } from '../../components/StatsCard';
import { Avatar } from '../../components/Avatar';
import { Colors } from '../../constants/colors';
import {
  BorderRadius,
  FontSize,
  FontWeight,
  Shadow,
  Spacing,
} from '../../constants/theme';
import { VolunteerStackParamList } from '../../types';
import { missionService } from '../../services/missionService';
type Nav = StackNavigationProp<VolunteerStackParamList>;
// State badge colours
const STATE_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  ACTIVE:    { bg: '#E6F4EA', text: '#2E7D32', label: 'Sedang Berlangsung' },
  COMPLETED: { bg: '#E3F2FD', text: '#1565C0', label: 'Selesai' },
  UPCOMING:  { bg: '#FFF8E1', text: '#E65100', label: 'Akan Datang' },
  CANCELLED: { bg: '#FDECEA', text: '#C62828', label: 'Dibatalkan' },
};
export function VolunteerHomeScreen() {
  const { user } = useAuth();
  const { isTracking, toggleTracking } = useTracking();
  const navigation = useNavigation<Nav>();
  const { missions, isLoading, isRefreshing, refresh } = useMissions({
    state: 'ACTIVE',
    limit: 5,
  });
  const [joiningId, setJoiningId] = useState<string | null>(null);
  // Live-updating Sejarah — re-fetches automatically on sejarah:updated socket event
  const {
    missions: myMissions,
    isLoading: isLoadingHistory,
    refresh: refreshHistory,
  } = useSejarah(user?.id);
  const totalMissions = myMissions.length > 0 ? myMissions.length : (user?.volunteerProfile?.totalMissions ?? 0);
  const completedMissions = myMissions.filter((m) => m.state === 'COMPLETED');
  const totalCerts = completedMissions.length;

  // Filter out missions the user has already joined so they only appear in "Misi Saya"
  const myMissionIds = new Set(myMissions.map((m) => m.id));
  const availableMissions = missions.filter((m) => !myMissionIds.has(m.id));
  const handleJoin = async (missionId: string) => {
    setJoiningId(missionId);
    try {
      await missionService.joinMission(missionId);
      refresh();
      refreshHistory();
      if (Platform.OS === 'web') {
        window.alert('🎉 Berjaya! Anda telah menyertai misi ini.');
      } else {
        Alert.alert('Berjaya! 🎉', 'Anda telah berjaya menyertai misi ini.');
      }
    } catch (err: any) {
      const status = err?.status;
      let msg = '';
      if (status === 409) {
        msg = err?.message?.includes('capacity') || err?.message?.includes('full')
          ? 'Misi ini sudah mencapai kapasiti maksimum.'
          : 'Anda telah pun mendaftar untuk misi ini.';
      } else if (status === 400) {
        msg = err?.message ?? 'Misi ini tidak lagi menerima sukarelawan.';
      } else {
        msg = err?.message ?? 'Tidak dapat menyertai misi. Sila cuba lagi.';
      }
      if (Platform.OS === 'web') {
        window.alert(msg);
      } else {
        Alert.alert('Tidak Dapat Sertai', msg);
      }
    } finally {
      setJoiningId(null);
    }
  };
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
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
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.appName}>Haiwan Kita</Text>
            <Text style={styles.greeting}>
              Hello, {user?.name?.split(' ')[0] ?? 'Sukarelawan'} 👋
            </Text>
          </View>
          <TouchableOpacity style={styles.avatarBtn}>
            <Avatar name={user?.name ?? 'U'} size={44} />
          </TouchableOpacity>
        </View>
        {/* GPS Broadcast Toggle */}
        <View style={styles.section}>
          <BroadcastToggle
            isTracking={isTracking}
            onToggle={() => {
              // Toggle with a generic projectId; in real use, user picks active mission
              const activeId = missions.find((m) => m.state === 'ACTIVE')?.id;
              if (activeId) {
                toggleTracking(activeId);
              } else {
                Alert.alert(
                  'Tiada Misi Aktif',
                  'Anda perlu menyertai misi aktif terlebih dahulu untuk berkongsi lokasi.'
                );
              }
            }}
          />
        </View>
        {/* Stats Row */}
        <View style={styles.statsRow}>
          <StatsCard
            value={totalMissions.toString().padStart(2, '0')}
            label="Projek"
            accent={Colors.primary}
          />
          <View style={{ width: Spacing.sm }} />
          <StatsCard
            value={totalCerts.toString().padStart(2, '0')}
            label="Sijil"
            accent={Colors.success}
          />
        </View>
        {/* Available Missions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Misi Tersedia</Text>
          <TouchableOpacity>
            <Text style={styles.viewAll}>Lihat Semua</Text>
          </TouchableOpacity>
        </View>
        {isLoading ? (
          <ActivityIndicator color={Colors.primary} style={{ marginVertical: Spacing.lg }} />
        ) : availableMissions.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>🐾 Tiada misi tersedia buat masa ini.</Text>
          </View>
        ) : (
          availableMissions.map((mission) => (
            <MissionCard
              key={mission.id}
              mission={mission}
              onPress={() =>
                navigation.navigate('MissionDetail', { missionId: mission.id })
              }
              onJoin={() => handleJoin(mission.id)}
              isJoining={joiningId === mission.id}
              showJoinButton
            />
          ))
        )}
        {/* Mission History */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Misi Saya</Text>
        </View>
        {isLoadingHistory ? (
          <ActivityIndicator color={Colors.primary} style={{ marginVertical: Spacing.md }} />
        ) : myMissions.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>🐾 Anda belum menyertai sebarang misi.</Text>
          </View>
        ) : (
          myMissions.slice(0, 5).map((m) => {
            const stateStyle = STATE_COLORS[m.state] ?? STATE_COLORS['UPCOMING'];
            return (
              <TouchableOpacity
                key={m.id}
                style={styles.historyCard}
                onPress={() => navigation.navigate('MissionDetail', { missionId: m.id })}
                activeOpacity={0.8}
              >
                <View style={styles.historyMain}>
                  <Text style={styles.historyTitle} numberOfLines={1}>{m.title}</Text>
                  <Text style={styles.historyLocation} numberOfLines={1}>
                    📍 {m.location.split(',')[0]}
                  </Text>
                  <Text style={styles.historyDate}>
                    📅 {new Date(m.startDate).toLocaleDateString('ms-MY', {
                      day: '2-digit', month: 'short', year: 'numeric',
                    })}
                  </Text>
                </View>
                <View style={[styles.stateBadge, { backgroundColor: stateStyle.bg }]}>
                  <Text style={[styles.stateBadgeText, { color: stateStyle.text }]}>
                    {stateStyle.label}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
        <View style={{ height: Spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.md },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  appName: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.extrabold,
    color: Colors.primary,
    letterSpacing: -0.5,
  },
  greeting: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  avatarBtn: {
    borderRadius: 22,
    borderWidth: 2,
    borderColor: Colors.primary + '40',
  },
  section: { marginBottom: Spacing.md },
  statsRow: {
    flexDirection: 'row',
    marginBottom: Spacing.lg,
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
    backgroundColor: Colors.cardBg,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing.md,
    ...Shadow.sm,
  },
  emptyText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  certCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadow.sm,
  },
  certTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  certStatus: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.success,
  },
  downloadBtn: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.successLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadow.sm,
  },
  historyMain: { flex: 1, marginRight: Spacing.sm },
  historyTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  historyLocation: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginBottom: 1,
  },
  historyDate: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  stateBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  stateBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    textAlign: 'center',
  },
});
