// src/screens/shared/ActivityHistoryScreen.tsx — Certificate download list
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { useSejarah } from '../../hooks/useSejarah';
import { attendanceService } from '../../services/attendanceService';
import { Colors } from '../../constants/colors';
import { BorderRadius, FontSize, FontWeight, Shadow, Spacing } from '../../constants/theme';
import { Mission } from '../../types';
export function ActivityHistoryScreen() {
  const { user } = useAuth();
  const { missions, isLoading, refresh } = useSejarah(user?.id);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const handleDownload = async (mission: Mission) => {
    if (!mission.certificateUrl) {
      Alert.alert('Sijil Belum Sedia', 'Sijil masih dalam proses penjanaan. Sila cuba lagi sebentar.');
      return;
    }
    setDownloadingId(mission.id);
    try {
      await attendanceService.openCertificate(mission.certificateUrl);
    } catch (err: any) {
      Alert.alert('Ralat', err?.message ?? 'Tidak dapat membuka sijil.');
    } finally {
      setDownloadingId(null);
    }
  };
  const renderCert = ({ item }: { item: Mission }) => {
    const isDownloading = downloadingId === item.id;
    // Determine the status configuration dynamically
    let statusLabel = 'TERDAFTAR';
    let statusColor = Colors.primary;
    let statusBg = Colors.primaryLight;
    let statusIcon = '🙋';
    let canDownload = false;
    if (item.certificateStatus === 'GENERATED' && item.certificateUrl) {
      statusLabel = 'SELESAI';
      statusColor = Colors.success;
      statusBg = Colors.successLight;
      statusIcon = '📜';
      canDownload = true;
    } else if (item.certificateStatus === 'GENERATING') {
      statusLabel = 'MENJANA...';
      statusColor = Colors.warning;
      statusBg = Colors.warningLight;
      statusIcon = '⏳';
    } else if (item.certificateStatus === 'FAILED') {
      statusLabel = 'GAGAL';
      statusColor = Colors.danger;
      statusBg = Colors.dangerLight;
      statusIcon = '⚠️';
    } else if (item.attendanceStatus === 'VERIFIED') {
      statusLabel = 'MENJANA...';
      statusColor = Colors.warning;
      statusBg = Colors.warningLight;
      statusIcon = '⏳';
    } else if (item.state === 'COMPLETED') {
      statusLabel = 'SEDANG DIPROSES';
      statusColor = Colors.warning;
      statusBg = Colors.warningLight;
      statusIcon = '⏳';
    } else if (item.state === 'ACTIVE') {
      statusLabel = 'AKTIF';
      statusColor = Colors.success;
      statusBg = Colors.successLight;
      statusIcon = '🏃';
    } else if (item.state === 'CANCELLED') {
      statusLabel = 'DIBATALKAN';
      statusColor = Colors.danger;
      statusBg = Colors.dangerLight;
      statusIcon = '❌';
    } else {
      statusLabel = 'AKAN DATANG';
      statusColor = '#E65100';
      statusBg = '#FFF8E1';
      statusIcon = '📅';
    }
    return (
      <View style={styles.certCard}>
        <View style={[styles.certIconBox, { backgroundColor: statusBg }]}>
          <Text style={{ fontSize: 22 }}>{statusIcon}</Text>
        </View>
        <View style={styles.certInfo}>
          <Text style={styles.certTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.certDate}>
            📅 {new Date(item.startDate).toLocaleDateString('ms-MY', {
              day: '2-digit', month: 'short', year: 'numeric',
            })}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
            <Text style={[styles.statusBadgeText, { color: statusColor }]}>
              {statusLabel}
            </Text>
          </View>
        </View>
        {canDownload && (
          <TouchableOpacity
            style={[styles.downloadBtn, isDownloading && styles.downloadBtnDisabled]}
            onPress={() => handleDownload(item)}
            disabled={isDownloading}
            activeOpacity={0.8}
          >
            {isDownloading ? (
              <ActivityIndicator size="small" color={Colors.success} />
            ) : (
              <Text style={styles.downloadIcon}>⬇️</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    );
  };
  // Derive counts dynamically
  const totalMissions = missions.length;
  const certsReady = missions.filter((m) => m.certificateStatus === 'GENERATED').length;
  const inProgress = missions.filter(
    (m) =>
      m.certificateStatus === 'GENERATING' ||
      (m.attendanceStatus === 'VERIFIED' && m.certificateStatus !== 'GENERATED') ||
      (m.state === 'COMPLETED' && m.certificateStatus !== 'GENERATED')
  ).length;
  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Sejarah Aktiviti</Text>
        <Text style={styles.subtitle}>{totalMissions} misi disertai</Text>
      </View>
      {/* Summary chips */}
      <View style={styles.chipsRow}>
        <View style={[styles.chip, { backgroundColor: Colors.successLight }]}>
          <Text style={[styles.chipNum, { color: Colors.success }]}>
            {certsReady}
          </Text>
          <Text style={styles.chipLabel}>Sijil Sedia</Text>
        </View>
        <View style={[styles.chip, { backgroundColor: Colors.warningLight }]}>
          <Text style={[styles.chipNum, { color: Colors.warning }]}>
            {inProgress}
          </Text>
          <Text style={styles.chipLabel}>Sedang Diproses</Text>
        </View>
        <View style={[styles.chip, { backgroundColor: Colors.primaryLight }]}>
          <Text style={[styles.chipNum, { color: Colors.primary }]}>
            {totalMissions}
          </Text>
          <Text style={styles.chipLabel}>Jumlah</Text>
        </View>
      </View>
      <FlatList
        data={missions}
        keyExtractor={(m) => m.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
        ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
          ) : (
            <View style={styles.emptyState}>
              <Text style={{ fontSize: 48, marginBottom: Spacing.md }}>📋</Text>
              <Text style={styles.emptyTitle}>Tiada Sejarah Aktiviti</Text>
              <Text style={styles.emptyBody}>
                Sertai misi dan sahkan kehadiran anda untuk mendapatkan sijil penyertaan.
              </Text>
            </View>
          )
        }
        renderItem={renderCert}
      />
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    padding: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  chipsRow: {
    flexDirection: 'row',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  chip: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.sm,
    alignItems: 'center',
  },
  chipNum: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.extrabold,
  },
  chipLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },
  list: {
    padding: Spacing.md,
    paddingBottom: 40,
  },
  certCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Shadow.sm,
  },
  certIconBox: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  certInfo: { flex: 1 },
  certTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: 4,
    lineHeight: 22,
  },
  certDate: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  statusBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },
  downloadBtn: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.successLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.sm,
  },
  downloadBtnDisabled: { opacity: 0.6 },
  downloadIcon: { fontSize: 18 },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: Spacing.xl,
  },
  emptyTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  emptyBody: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});