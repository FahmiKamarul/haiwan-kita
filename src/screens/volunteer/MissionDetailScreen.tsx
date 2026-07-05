// src/screens/volunteer/MissionDetailScreen.tsx — Rajah 3.20
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StatusBar,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { missionService } from '../../services/missionService';
import { attendanceService } from '../../services/attendanceService';
import { useAuth } from '../../context/AuthContext';
import { Mission, VolunteerStackParamList } from '../../types';
import { Colors, CategoryColors } from '../../constants/colors';
import {
  BorderRadius,
  FontSize,
  FontWeight,
  Shadow,
  Spacing,
} from '../../constants/theme';
import { Avatar } from '../../components/Avatar';
import { Avatar } from '../../components/Avatar';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import api from '../../lib/api';

type Route = RouteProp<VolunteerStackParamList, 'MissionDetail'>;
type Nav = StackNavigationProp<VolunteerStackParamList>;

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ms-MY', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-MY', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

const STATE_COLORS: Record<string, string> = {
  UPCOMING: Colors.info,
  ACTIVE: Colors.success,
  COMPLETED: Colors.textMuted,
  CANCELLED: Colors.danger,
};

export function MissionDetailScreen() {
  const { user } = useAuth();
  const route = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const { missionId } = route.params;

  const isVolunteer = user?.role === 'VOLUNTEER';

  const [mission, setMission] = useState<Mission | null>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    loadMission();
  }, [missionId]);

  const [reviewsData, setReviewsData] = useState<any>(null);

  const loadMission = async () => {
    setIsLoading(true);
    try {
      const data = await missionService.getMissionById(missionId);
      setMission(data);
      if (user?.role === 'MEMBER' || user?.role === 'ADMIN') {
        try {
          const parts = await missionService.getParticipants(missionId);
          setParticipants(parts);
        } catch (e) {
          console.error('Failed to load participants', e);
        }
        try {
          const revRes = await api.get(`/api/v1/missions/${missionId}/reviews`);
          setReviewsData(revRes.data.data);
        } catch (e) {
          console.error('Failed to load reviews', e);
        }
      }
    } catch (err: any) {
      Alert.alert('Ralat', 'Tidak dapat memuatkan butiran misi.');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!mission) return;
    setIsJoining(true);
    try {
      await missionService.joinMission(mission.id);
      await loadMission();
      if (Platform.OS === 'web') {
        window.alert('🎉 Berjaya! Anda telah menyertai misi ini.');
      } else {
        Alert.alert('Berjaya! 🎉', 'Anda telah berjaya menyertai misi ini!');
      }
    } catch (err: any) {
      const status = err?.status;
      let msg = '';
      if (status === 409) {
        msg = err?.message?.includes('full')
          ? 'Misi ini sudah penuh.'
          : 'Anda telah pun mendaftar untuk misi ini.';
      } else if (status === 400) {
        msg = err?.message ?? 'Misi ini tidak lagi aktif.';
      } else {
        msg = err?.message ?? 'Cuba lagi sebentar.';
      }
      if (Platform.OS === 'web') {
        window.alert(msg);
      } else {
        Alert.alert('Tidak Dapat Sertai', msg);
      }
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeave = async () => {
    if (!mission) return;
    const doLeave = async () => {
      setIsJoining(true);
      try {
        await missionService.leaveMission(mission.id);
        await loadMission();
        if (Platform.OS === 'web') {
          window.alert('Pendaftaran anda telah dibatalkan.');
        } else {
          Alert.alert('Batal Pendaftaran', 'Pendaftaran anda telah berjaya dibatalkan.');
        }
      } catch (err: any) {
        if (Platform.OS === 'web') {
          window.alert(err?.message || 'Ralat.');
        } else {
          Alert.alert('Ralat', err?.message || 'Tidak dapat membatalkan pendaftaran.');
        }
      } finally {
        setIsJoining(false);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Anda pasti ingin membatalkan pendaftaran untuk misi ini?')) {
        doLeave();
      }
    } else {
      Alert.alert(
        'Batal Pendaftaran?',
        'Anda pasti ingin membatalkan pendaftaran untuk misi ini?',
        [
          { text: 'Tidak', style: 'cancel' },
          { text: 'Ya, Batal', style: 'destructive', onPress: doLeave },
        ],
      );
    }
  };

  const handleDownloadCertificate = async () => {
    if (!mission?.certificateUrl) return;
    setIsDownloading(true);
    try {
      await attendanceService.openCertificate(mission.certificateUrl);
    } catch (err: any) {
      if (Platform.OS === 'web') {
        window.alert(err?.message || 'Ralat memuat turun sijil.');
      } else {
        Alert.alert('Ralat', err?.message || 'Tidak dapat memuat turun sijil.');
      }
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading || !mission) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const catColor = CategoryColors[mission.category] ?? Colors.catOther;
  const categoryLabel = mission.category.charAt(0) + mission.category.slice(1).toLowerCase();
  const stateColor = STATE_COLORS[mission.state] ?? Colors.textMuted;
  const canJoin = !mission.isFull && mission.state !== 'COMPLETED' && mission.state !== 'CANCELLED';

  // Cancel registration logic: allowed only if >7 days before mission
  const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
  const msUntilMission = new Date(mission.startDate).getTime() - Date.now();
  const withinCancellationCutoff = msUntilMission < ONE_WEEK_MS;  // within 7 days = locked
  const canCancel = mission.isJoined && !withinCancellationCutoff;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.textPrimary} />

      {/* Hero image area */}
      <View style={styles.heroContainer}>
        <View style={styles.heroPlaceholder}>
          <Text style={{ fontSize: 64 }}>🐾</Text>
        </View>

        {/* Back button */}
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>‹</Text>
        </TouchableOpacity>

        {/* Category badge */}
        <View style={[styles.catBadge, { backgroundColor: catColor }]}>
          <Text style={styles.catBadgeText}>
            {mission.category.toUpperCase()} & KEBAJIKAN
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Title */}
        <View style={styles.contentPad}>
          <Text style={styles.missionTitle}>{mission.title}</Text>

          {/* Meta grid */}
          <View style={styles.metaGrid}>
            <View style={styles.metaItem}>
              <Text style={styles.metaIcon}>📅</Text>
              <View>
                <Text style={styles.metaValue}>{formatDate(mission.startDate)}</Text>
                <Text style={styles.metaLabel}>{formatTime(mission.startDate)}</Text>
              </View>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaIcon}>📍</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.metaValue} numberOfLines={1}>
                  {mission.location.split(',')[0]}
                </Text>
                <Text style={styles.metaLabel} numberOfLines={1}>
                  {mission.location.split(',').slice(1).join(',').trim()}
                </Text>
              </View>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaIcon}>👥</Text>
              <View>
                <Text style={styles.metaValue}>Diperlukan</Text>
                <Text style={styles.metaLabel}>{mission.requiredVolunteers} Sukarelawan</Text>
              </View>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaIcon}>🎯</Text>
              <View>
                <Text style={styles.metaValue}>Sasaran</Text>
                <Text style={styles.metaLabel}>{categoryLabel}</Text>
              </View>
            </View>
          </View>

          {/* Organizer */}
          <View style={styles.organizerRow}>
            <Avatar name={mission.createdBy.name} size={40} />
            <View style={{ marginLeft: Spacing.sm }}>
              <Text style={styles.organizerName}>{mission.createdBy.name}</Text>
              <Text style={styles.organizerRole}>
                Penganjur • Ahli sejak {new Date(mission.createdAt).getFullYear()}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* About */}
          <Text style={styles.sectionTitle}>Tentang Misi Ini</Text>
          <Text style={styles.bodyText}>{mission.description}</Text>

          <View style={styles.divider} />

          {/* What to prepare */}
          <Text style={styles.sectionTitle}>Apa Yang Perlu Disediakan?</Text>
          <Text style={styles.bodyText}>
            Sila pakai pakaian yang sesuai dan kasut bertutup. Peralatan pertolongan
            cemas asas dan makanan haiwan akan disediakan oleh SAFM. Pastikan GPS
            anda aktif semasa misi untuk keselamatan dan penyelarasan.
          </Text>

          {user?.role === 'MEMBER' && participants.length > 0 && (
            <>
              <View style={styles.divider} />
              <Text style={styles.sectionTitle}>Senarai Sukarelawan ({participants.length})</Text>
              {participants.map((p, index) => (
                <View key={index} style={styles.participantRow}>
                  <Avatar name={p.name} size={40} />
                  <View style={styles.participantInfo}>
                    <Text style={styles.participantName}>{p.name}</Text>
                    {/* The API does not currently return attendanceStatus, so we omit it or default it */}
                  </View>
                </View>
              ))}
            </>
          )}
          {/* Reviews section (Member/Admin only) */}
          {(user?.role === 'MEMBER' || user?.role === 'ADMIN') && reviewsData && reviewsData.summary.totalReviews > 0 && (
            <>
              <View style={styles.divider} />
              <Text style={styles.sectionTitle}>Maklum Balas Sukarelawan</Text>
              
              <View style={styles.reviewSummary}>
                <Text style={styles.reviewSummaryScore}>{reviewsData.summary.averageRatings.overall}</Text>
                <Text style={styles.reviewSummaryText}>Daripada {reviewsData.summary.totalReviews} Ulasan</Text>
              </View>

              {reviewsData.reviews.map((r: any) => (
                <View key={r.id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <Avatar name={r.user.name} size={32} />
                    <View style={{ marginLeft: 10, flex: 1 }}>
                      <Text style={styles.reviewName}>{r.user.name}</Text>
                      <Text style={styles.reviewDate}>{new Date(r.createdAt).toLocaleDateString()}</Text>
                    </View>
                    <Text style={styles.reviewStar}>⭐ {r.overallRating}</Text>
                  </View>
                  {r.comment && <Text style={styles.reviewComment}>{r.comment}</Text>}
                </View>
              ))}
            </>
          )}
        </View>
      </ScrollView>

      {/* Bottom action bar — Volunteers only */}
      {isVolunteer && (
        <View style={styles.bottomBar}>
          {/* Spots info — only shown when not already joined */}
          {!mission.isJoined && (
            <View style={styles.spotsContainer}>
              <Text style={styles.spotsNumber}>
                {String(mission.spotsRemaining).padStart(2, '0')}
              </Text>
              <Text style={styles.spotsLabel}>Tempat{'\n'}Tersisa</Text>
            </View>
          )}

          {mission.isJoined ? (
            /* ── Already registered ── */
            mission.state === 'COMPLETED' ? (
              /* Completed mission - check for certificate */
              mission.certificateStatus === 'GENERATED' && mission.certificateUrl ? (
                <TouchableOpacity
                  style={[styles.joinBtn, { backgroundColor: Colors.success }, isDownloading && styles.joinBtnDisabled]}
                  onPress={handleDownloadCertificate}
                  disabled={isDownloading}
                  activeOpacity={0.85}
                >
                  {isDownloading ? (
                    <ActivityIndicator color={Colors.white} />
                  ) : (
                    <Text style={styles.joinBtnText}>⬇️ Muat Turun Sijil</Text>
                  )}
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={[styles.joinBtn, styles.joinBtnDisabled]} disabled activeOpacity={1}>
                  <Text style={styles.joinBtnText}>Selesai</Text>
                </TouchableOpacity>
              )
            ) : canCancel ? (
              /* More than 7 days away — allow cancel */
              <TouchableOpacity
                style={[styles.cancelBtn, isJoining && styles.joinBtnDisabled]}
                onPress={handleLeave}
                disabled={isJoining}
                activeOpacity={0.85}
              >
                {isJoining ? (
                  <ActivityIndicator color={Colors.danger} />
                ) : (
                  <Text style={styles.cancelBtnText}>✕  Batal Pendaftaran</Text>
                )}
              </TouchableOpacity>
            ) : (
              /* Within 7 days — locked */
              <TouchableOpacity style={styles.lockedBtn} disabled activeOpacity={1}>
                <Text style={styles.lockedBtnText}>
                  🔒  Tidak Boleh Dibatalkan
                </Text>
                <Text style={styles.lockedBtnSub}>
                  Pendaftaran dikunci 1 minggu sebelum misi
                </Text>
              </TouchableOpacity>
            )
          ) : (
            /* ── Not yet registered ── */
            <TouchableOpacity
              style={[
                styles.joinBtn,
                (!canJoin || isJoining) && styles.joinBtnDisabled,
              ]}
              onPress={handleJoin}
              disabled={!canJoin || isJoining}
              activeOpacity={0.85}
            >
              {isJoining ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.joinBtnText}>
                  {mission.isFull ? 'Penuh' : mission.state === 'CANCELLED' ? 'Dibatalkan' : 'Sertai Misi'}
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      )}

      <LoadingOverlay visible={isJoining} message={mission.isJoined ? 'Membatalkan...' : 'Menyertai misi...'} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  heroContainer: {
    height: 240,
    position: 'relative',
    overflow: 'hidden',
  },
  heroPlaceholder: {
    flex: 1,
    backgroundColor: Colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtn: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.sm,
  },
  backBtnText: {
    fontSize: 28,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    lineHeight: 32,
  },
  catBadge: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  catBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.white,
    letterSpacing: 0.5,
  },
  scroll: { flex: 1 },
  contentPad: { padding: Spacing.lg },
  missionTitle: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.extrabold,
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
    lineHeight: 38,
  },
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '45%',
  },
  metaIcon: { fontSize: 18, marginRight: 8, marginTop: 1 },
  metaValue: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  metaLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  organizerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  organizerName: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  organizerRole: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  bodyText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 26,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    paddingBottom: Spacing.lg,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    ...Shadow.lg,
  },
  spotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Spacing.lg,
  },
  spotsNumber: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.extrabold,
    color: Colors.primary,
    marginRight: 6,
  },
  spotsLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  joinBtn: {
    flex: 1,
    height: 52,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  joinBtnDisabled: {
    backgroundColor: Colors.textMuted,
    shadowOpacity: 0,
    elevation: 0,
  },
  joinBtnText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.white,
  },
  cancelBtn: {
    flex: 1,
    height: 52,
    backgroundColor: Colors.dangerLight,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.danger,
  },
  cancelBtnText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.danger,
  },
  lockedBtn: {
    flex: 1,
    height: 60,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  lockedBtnText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textMuted,
  },
  lockedBtnSub: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 3,
    textAlign: 'center',
  },
  participantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  participantInfo: {
    marginLeft: Spacing.sm,
    flex: 1,
  },
  participantName: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  participantStatus: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  reviewSummary: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: Spacing.md,
  },
  reviewSummaryScore: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#F59E0B',
    marginRight: 8,
  },
  reviewSummaryText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  reviewCard: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  reviewName: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  reviewDate: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  reviewStar: {
    fontSize: FontSize.sm,
    fontWeight: 'bold',
    color: '#F59E0B',
  },
  reviewComment: {
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
});
