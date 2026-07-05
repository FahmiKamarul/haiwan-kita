// src/screens/admin/AdminDashboard.tsx — Rajah 3.27
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
  Platform,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useMissions } from '../../hooks/useMissions';
import { useUsers } from '../../hooks/useUsers';
import { attendanceService } from '../../services/attendanceService';
import { AdminStackParamList } from '../../types';
import { Colors } from '../../constants/colors';
import { BorderRadius, FontSize, FontWeight, Shadow, Spacing } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';

type Nav = StackNavigationProp<AdminStackParamList>;

export function AdminDashboard() {
  const navigation = useNavigation<Nav>();
  const { user, logout } = useAuth();
  const { missions, isRefreshing, refresh } = useMissions({ limit: 10 });
  
  const { users: volunteers, refresh: refreshVolunteers } = useUsers('VOLUNTEER');
  const { users: members, refresh: refreshMembers } = useUsers('MEMBER');

  const [volModalVisible, setVolModalVisible] = useState(false);
  const [memModalVisible, setMemModalVisible] = useState(false);

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Adakah anda pasti ingin log keluar?')) {
        logout();
      }
    } else {
      Alert.alert('Log Keluar', 'Adakah anda pasti ingin log keluar?', [
        { text: 'Batal', style: 'cancel' },
        { text: 'Log Keluar', style: 'destructive', onPress: logout },
      ]);
    }
  };

  // Pending missions (placeholder filter)
  const pendingMissions = missions.filter((m) => m.state === 'UPCOMING');
  const activeMissions = missions.filter((m) => m.state === 'ACTIVE');

  const [actingId, setActingId] = React.useState<string | null>(null);

  const confirmAction = (message: string): boolean => {
    if (Platform.OS === 'web') {
      return window.confirm(message);
    }
    return true; // On native, use Alert callbacks below
  };

  const handleApprove = async (projectId: string, title: string) => {
    const doApprove = async () => {
      setActingId(projectId);
      try {
        await attendanceService.approveProject(projectId);
        refresh();
      } catch (err: any) {
        if (Platform.OS === 'web') {
          window.alert(err?.message ?? 'Tidak dapat meluluskan projek.');
        } else {
          Alert.alert('Ralat', err?.message ?? 'Tidak dapat meluluskan projek.');
        }
      } finally {
        setActingId(null);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`Luluskan "${title}"? Projek ini akan diaktifkan untuk sukarelawan.`)) {
        doApprove();
      }
    } else {
      Alert.alert(`Luluskan "${title}"?`, 'Projek ini akan diaktifkan untuk sukarelawan.', [
        { text: 'Batal', style: 'cancel' },
        { text: '✅ Luluskan', onPress: doApprove },
      ]);
    }
  };

  const handleReject = async (projectId: string, title: string) => {
    const doReject = async () => {
      setActingId(projectId);
      try {
        await attendanceService.rejectProject(projectId);
        refresh();
      } catch (err: any) {
        if (Platform.OS === 'web') {
          window.alert(err?.message ?? 'Tidak dapat menolak projek.');
        } else {
          Alert.alert('Ralat', err?.message ?? 'Tidak dapat menolak projek.');
        }
      } finally {
        setActingId(null);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`Tolak "${title}"? Projek ini tidak akan dipaparkan kepada sukarelawan.`)) {
        doReject();
      }
    } else {
      Alert.alert(`Tolak "${title}"?`, 'Projek ini tidak akan dipaparkan.', [
        { text: 'Batal', style: 'cancel' },
        { text: '❌ Tolak', style: 'destructive', onPress: doReject },
      ]);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => {
              refresh();
              refreshVolunteers();
              refreshMembers();
            }}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.appName}>Haiwan Kita</Text>
            <Text style={styles.portalLabel}>Portal Pentadbir</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.adminName}>{user?.name} (Admin)</Text>
            <TouchableOpacity onPress={handleLogout} style={{ marginTop: 4, padding: 4 }}>
              <Text style={{ color: Colors.danger, fontSize: FontSize.sm, fontWeight: FontWeight.bold }}>
                Log Keluar
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.content}>
          {/* Stats */}
          <View style={styles.statsRow}>
            <TouchableOpacity style={styles.statCard} onPress={() => setVolModalVisible(true)}>
              <Text style={styles.statNum}>{String(volunteers.length).padStart(2, '0')}</Text>
              <Text style={styles.statLabel}>JUMLAH{'\n'}SUKARELAWAN</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.statCard} onPress={() => setMemModalVisible(true)}>
              <Text style={styles.statNum}>{String(members.length).padStart(2, '0')}</Text>
              <Text style={styles.statLabel}>JUMLAH{'\n'}AHLI</Text>
            </TouchableOpacity>

            <View style={styles.statCard}>
              <Text style={[styles.statNum, { color: Colors.warning }]}>
                {String(pendingMissions.length).padStart(2, '0')}
              </Text>
              <Text style={styles.statLabel}>PROJEK{'\n'}MENUNGGU</Text>
            </View>
          </View>

          {/* Live Tracking Card */}
          <TouchableOpacity style={styles.trackingCard} onPress={() => navigation.navigate('Map' as any)} activeOpacity={0.8}>
            <View style={styles.trackingHeader}>
              <Text style={styles.trackingTitle}>Penjejakan Langsung Sukarelawan</Text>
              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>LANGSUNG</Text>
              </View>
            </View>

            {/* Map placeholder */}
            <View style={styles.mapPlaceholder}>
              <Text style={{ fontSize: 48 }}>🗺️</Text>
              <Text style={styles.mapPlaceholderText}>
                Buka Tab Peta untuk melihat {activeMissions.length} sukarelawan aktif di lapangan
              </Text>
            </View>
            <Text style={styles.trackingFooter}>
              Memantau {activeMissions.length} sukarelawan aktif di lapangan.
            </Text>
          </TouchableOpacity>

          {/* Pending Approvals */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Kelulusan Tertangguh</Text>
          </View>

          {pendingMissions.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>✅ Tiada projek menunggu kelulusan.</Text>
            </View>
          ) : (
            pendingMissions.slice(0, 5).map((mission) => {
              const isActingThis = actingId === mission.id;
              return (
                <View key={mission.id} style={styles.approvalCard}>
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate('ReviewProject', {
                        projectId: mission.id,
                        projectTitle: mission.title,
                      })
                    }
                  >
                    <Text style={styles.approvalTitle} numberOfLines={1}>
                      {mission.title} ›
                    </Text>
                    <Text style={styles.approvalMeta}>
                      Oleh {mission.createdBy.name} •{' '}
                      {new Date(mission.startDate).toLocaleDateString('ms-MY', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </Text>
                  </TouchableOpacity>
                  <View style={styles.approvalBtns}>
                    <TouchableOpacity
                      style={[styles.approveBtn, isActingThis && { opacity: 0.6 }]}
                      onPress={() => handleApprove(mission.id, mission.title)}
                      disabled={isActingThis}
                    >
                      {isActingThis ? (
                        <ActivityIndicator size="small" color={Colors.success} />
                      ) : (
                        <Text style={styles.approveBtnText}>✓ LULUS</Text>
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.rejectBtn, isActingThis && { opacity: 0.6 }]}
                      onPress={() => handleReject(mission.id, mission.title)}
                      disabled={isActingThis}
                    >
                      {isActingThis ? (
                        <ActivityIndicator size="small" color={Colors.danger} />
                      ) : (
                        <Text style={styles.rejectBtnText}>✕ TOLAK</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}

          {/* Quick-link to ReviewProject for pending missions */}
          {pendingMissions.slice(0, 3).map((m) => (
            <TouchableOpacity
              key={`review-${m.id}`}
              style={styles.reviewLink}
              onPress={() =>
                navigation.navigate('ReviewProject', {
                  projectId: m.id,
                  projectTitle: m.title,
                })
              }
            >
              <Text style={styles.reviewLinkText}>
                📋 Semak butiran: {m.title}
              </Text>
              <Text style={styles.reviewLinkArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Volunteer Modal */}
      <Modal visible={volModalVisible} animationType="slide" transparent={true} onRequestClose={() => setVolModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Senarai Sukarelawan</Text>
              <TouchableOpacity onPress={() => setVolModalVisible(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={volunteers}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.userListItem}>
                  <Text style={styles.userName}>{item.name}</Text>
                  <Text style={styles.userEmail}>{item.email}</Text>
                  {item.phone && <Text style={styles.userPhone}>{item.phone}</Text>}
                  <Text style={styles.userId}>ID: {item.id}</Text>
                </View>
              )}
              contentContainerStyle={styles.listContent}
            />
          </View>
        </View>
      </Modal>

      {/* Member Modal */}
      <Modal visible={memModalVisible} animationType="slide" transparent={true} onRequestClose={() => setMemModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Senarai Ahli</Text>
              <TouchableOpacity onPress={() => setMemModalVisible(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={members}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.userListItem}>
                  <Text style={styles.userName}>{item.name}</Text>
                  <Text style={styles.userEmail}>{item.email}</Text>
                  {item.phone && <Text style={styles.userPhone}>{item.phone}</Text>}
                  <Text style={styles.userId}>ID: {item.id}</Text>
                </View>
              )}
              contentContainerStyle={styles.listContent}
            />
          </View>
        </View>
      </Modal>
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
  appName: { fontSize: FontSize.xl, fontWeight: FontWeight.extrabold, color: Colors.primary },
  portalLabel: { fontSize: FontSize.xs, color: Colors.textSecondary },
  adminName: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textSecondary },
  content: { padding: Spacing.md },
  statsRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.md },
  statCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    ...Shadow.sm,
  },
  statNum: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.extrabold,
    color: Colors.textPrimary,
    lineHeight: 48,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: FontWeight.semibold,
    color: Colors.textMuted,
    letterSpacing: 0,
    marginTop: 4,
    textAlign: 'center',
  },
  trackingCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadow.sm,
  },
  trackingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  trackingTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dangerLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.danger, marginRight: 5 },
  liveText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: Colors.danger },
  mapPlaceholder: {
    height: 160,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    marginBottom: Spacing.sm,
    gap: 8,
  },
  mapPlaceholderText: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textAlign: 'center',
    maxWidth: '70%',
  },
  trackingFooter: { fontSize: FontSize.xs, color: Colors.textMuted, textAlign: 'center' },
  sectionHeader: { marginBottom: Spacing.sm },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  emptyCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    ...Shadow.sm,
    marginBottom: Spacing.sm,
  },
  emptyText: { fontSize: FontSize.sm, color: Colors.success },
  approvalCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadow.sm,
  },
  approvalInfo: { marginBottom: Spacing.sm },
  approvalTitle: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  approvalMeta: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  approvalBtns: { flexDirection: 'row', gap: Spacing.sm },
  approveBtn: {
    flex: 1,
    height: 38,
    backgroundColor: Colors.successLight,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.success,
  },
  approveBtnText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.success },
  rejectBtn: {
    flex: 1,
    height: 38,
    backgroundColor: Colors.dangerLight,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.danger,
  },
  rejectBtnText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.danger },
  reviewLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    backgroundColor: Colors.primaryLight,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  reviewLinkText: { fontSize: FontSize.sm, color: Colors.primaryDark, flex: 1 },
  reviewLinkArrow: { fontSize: 20, color: Colors.primary },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: Spacing.md,
  },
  modalContainer: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  closeBtn: { fontSize: 24, color: Colors.textSecondary, paddingHorizontal: Spacing.sm },
  listContent: { padding: Spacing.md },
  userListItem: {
    backgroundColor: Colors.background,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  userName: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  userEmail: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  userPhone: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  userId: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 4, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
});
