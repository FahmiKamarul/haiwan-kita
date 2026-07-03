// src/screens/admin/ReviewProjectScreen.tsx — Rajah 3.28
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { missionService } from '../../services/missionService';
import { attendanceService } from '../../services/attendanceService';
import { Mission, AdminStackParamList } from '../../types';
import { Colors, CategoryColors } from '../../constants/colors';
import { BorderRadius, FontSize, FontWeight, Shadow, Spacing } from '../../constants/theme';
import { Avatar } from '../../components/Avatar';
import { LoadingOverlay } from '../../components/LoadingOverlay';

type Route = RouteProp<AdminStackParamList, 'ReviewProject'>;
type Nav = StackNavigationProp<AdminStackParamList>;

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ms-MY', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function ReviewProjectScreen() {
  const route = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const { projectId, projectTitle } = route.params;

  const [mission, setMission] = useState<Mission | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActing, setIsActing] = useState(false);

  useEffect(() => {
    loadMission();
  }, [projectId]);

  const loadMission = async () => {
    setIsLoading(true);
    try {
      const data = await missionService.getMissionById(projectId);
      setMission(data);
    } catch {
      Alert.alert('Ralat', 'Tidak dapat memuatkan butiran projek.');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = () => {
    const doApprove = async () => {
      setIsActing(true);
      try {
        await attendanceService.approveProject(projectId);
        if (Platform.OS === 'web') {
          window.alert('✅ Projek telah diluluskan dan kini aktif untuk sukarelawan.');
          navigation.goBack();
        } else {
          Alert.alert('Berjaya! ✅', 'Projek telah diluluskan.', [
            { text: 'OK', onPress: () => navigation.goBack() },
          ]);
        }
      } catch (err: any) {
        if (Platform.OS === 'web') {
          window.alert(err?.message ?? 'Tidak dapat meluluskan projek.');
        } else {
          Alert.alert('Ralat', err?.message ?? 'Tidak dapat meluluskan projek.');
        }
      } finally {
        setIsActing(false);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`Luluskan "${mission?.title}"? Projek akan diaktifkan untuk sukarelawan.`)) {
        doApprove();
      }
    } else {
      Alert.alert(
        'Luluskan Projek?',
        `"${mission?.title}" akan diaktifkan untuk sukarelawan.`,
        [
          { text: 'Batal', style: 'cancel' },
          { text: '✅ Sahkan (Luluskan)', onPress: doApprove },
        ]
      );
    }
  };

  const handleReject = () => {
    const doReject = async () => {
      setIsActing(true);
      try {
        await attendanceService.rejectProject(projectId);
        if (Platform.OS === 'web') {
          window.alert('Projek telah ditolak.');
          navigation.goBack();
        } else {
          Alert.alert('Ditolak', 'Projek telah ditolak.', [
            { text: 'OK', onPress: () => navigation.goBack() },
          ]);
        }
      } catch (err: any) {
        if (Platform.OS === 'web') {
          window.alert(err?.message ?? 'Tidak dapat menolak projek.');
        } else {
          Alert.alert('Ralat', err?.message ?? 'Tidak dapat menolak projek.');
        }
      } finally {
        setIsActing(false);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`Tolak "${mission?.title}"? Projek tidak akan dipaparkan kepada sukarelawan.`)) {
        doReject();
      }
    } else {
      Alert.alert(
        'Tolak Projek?',
        `"${mission?.title}" akan ditolak dan tidak akan dipaparkan kepada sukarelawan.`,
        [
          { text: 'Batal', style: 'cancel' },
          { text: '❌ Tolak', style: 'destructive', onPress: doReject },
        ]
      );
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
  const categoryLabel =
    mission.category.charAt(0) + mission.category.slice(1).toLowerCase();

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Semak Permintaan Projek</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Pending banner */}
        <View style={styles.pendingBanner}>
          <Text style={styles.pendingIcon}>⏳</Text>
          <Text style={styles.pendingText}>
            MENUNGGU KELULUSAN: Dikemukakan pada{' '}
            {formatDate(mission.createdAt)}
          </Text>
        </View>

        <View style={styles.content}>
          {/* Category badge */}
          <View style={[styles.catBadge, { backgroundColor: catColor + '20' }]}>
            <Text style={[styles.catBadgeText, { color: catColor }]}>
              {mission.category.toUpperCase()}
            </Text>
          </View>

          {/* Title */}
          <Text style={styles.missionTitle}>{mission.title}</Text>

          {/* Info Grid */}
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>TARIKH</Text>
              <View style={styles.infoValueRow}>
                <Text style={styles.infoIcon}>📅</Text>
                <Text style={styles.infoValue}>{formatDate(mission.startDate)}</Text>
              </View>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>LOKASI</Text>
              <View style={styles.infoValueRow}>
                <Text style={styles.infoIcon}>📍</Text>
                <Text style={styles.infoValue} numberOfLines={1}>
                  {mission.location.split(',')[0]}
                </Text>
              </View>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>SUKARELAWAN DIPERLUKAN</Text>
              <View style={styles.infoValueRow}>
                <Text style={styles.infoIcon}>👥</Text>
                <Text style={styles.infoValue}>
                  {mission.requiredVolunteers} Orang
                </Text>
              </View>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>STATUS SEMASA</Text>
              <View
                style={[
                  styles.statusPill,
                  { backgroundColor: Colors.warningLight },
                ]}
              >
                <Text style={[styles.statusPillText, { color: Colors.warning }]}>
                  ● Menunggu
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Objectives */}
          <Text style={styles.sectionTitle}>Objektif Misi</Text>
          <Text style={styles.bodyText}>{mission.description}</Text>

          <View style={styles.divider} />

          {/* Requester */}
          <Text style={styles.sectionTitle}>Dikemukakan Oleh</Text>
          <View style={styles.requesterRow}>
            <Avatar name={mission.createdBy.name} size={44} />
            <View style={{ marginLeft: Spacing.sm }}>
              <Text style={styles.requesterName}>{mission.createdBy.name}</Text>
              <Text style={styles.requesterRole}>
                Peranan: Ahli Persatuan (Ahli Persatuan)
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.rejectBtn, isActing && styles.btnDisabled]}
          onPress={handleReject}
          disabled={isActing}
          activeOpacity={0.85}
        >
          <Text style={styles.rejectBtnText}>✕  Tolak</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.approveBtn, isActing && styles.btnDisabled]}
          onPress={handleApprove}
          disabled={isActing}
          activeOpacity={0.85}
        >
          <Text style={styles.approveBtnText}>✓  Sahkan (Luluskan)</Text>
        </TouchableOpacity>
      </View>

      <LoadingOverlay visible={isActing} message="Memproses..." />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.white,
  },
  backBtn: { marginRight: Spacing.sm, padding: 4 },
  backArrow: { fontSize: 28, color: Colors.textPrimary, lineHeight: 32 },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  pendingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.warningLight,
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.warning + '40',
  },
  pendingIcon: { fontSize: 16, marginRight: 8 },
  pendingText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.warning,
    flex: 1,
  },
  content: { padding: Spacing.lg },
  catBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.sm,
  },
  catBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.5,
  },
  missionTitle: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.extrabold,
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
    lineHeight: 34,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.lg,
    marginBottom: Spacing.md,
  },
  infoItem: { width: '44%' },
  infoLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  infoValueRow: { flexDirection: 'row', alignItems: 'center' },
  infoIcon: { fontSize: 14, marginRight: 5 },
  infoValue: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    flex: 1,
  },
  statusPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  statusPillText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold },
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
  requesterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  requesterName: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  requesterRole: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: Spacing.sm,
    padding: Spacing.md,
    paddingBottom: Spacing.lg,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    ...Shadow.lg,
  },
  rejectBtn: {
    flex: 1,
    height: 52,
    backgroundColor: Colors.dangerLight,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.danger,
  },
  rejectBtnText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.danger,
  },
  approveBtn: {
    flex: 2,
    height: 52,
    backgroundColor: Colors.success,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  approveBtnText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.white,
  },
  btnDisabled: { opacity: 0.6 },
});
