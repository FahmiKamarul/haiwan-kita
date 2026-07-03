// src/screens/member/MarkAttendanceScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { missionService, Participant } from '../../services/missionService';
import { attendanceService } from '../../services/attendanceService';
import { MemberStackParamList } from '../../types';
import { Colors } from '../../constants/colors';
import { BorderRadius, FontSize, FontWeight, Shadow, Spacing } from '../../constants/theme';
import { Avatar } from '../../components/Avatar';
import { LoadingOverlay } from '../../components/LoadingOverlay';

type Route = RouteProp<MemberStackParamList, 'MarkAttendance'>;
type Nav = StackNavigationProp<MemberStackParamList>;

interface AttendeeRow extends Participant {
  isPresent: boolean;
}

export function MarkAttendanceScreen() {
  const route = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const { missionId, missionTitle } = route.params;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isConcluding, setIsConcluding] = useState(false);
  const [attendanceSaved, setAttendanceSaved] = useState(false);
  const [search, setSearch] = useState('');
  const [attendees, setAttendees] = useState<AttendeeRow[]>([]);

  // ── Load real participants from API ──────────────────────────────
  useEffect(() => {
    loadParticipants();
  }, [missionId]);

  const loadParticipants = async () => {
    setIsLoading(true);
    try {
      const participants = await missionService.getParticipants(missionId);
      setAttendees(participants.map((p) => ({ ...p, isPresent: false })));
    } catch (err: any) {
      const msg = err?.message ?? 'Tidak dapat memuatkan senarai peserta.';
      if (Platform.OS === 'web') {
        window.alert(msg);
      } else {
        Alert.alert('Ralat', msg);
      }
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAttendees = attendees.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase())
  );

  const presentCount = attendees.filter((a) => a.isPresent).length;
  const absentCount = attendees.length - presentCount;

  const togglePresence = (userId: string) => {
    setAttendees((prev) =>
      prev.map((a) => (a.userId === userId ? { ...a, isPresent: !a.isPresent } : a))
    );
  };

  const handleSave = async () => {
    const presentList = attendees.filter((a) => a.isPresent);
    if (presentList.length === 0) {
      const msg = 'Sila tandakan sekurang-kurangnya seorang sukarelawan hadir.';
      if (Platform.OS === 'web') {
        window.alert(msg);
      } else {
        Alert.alert('Tiada Kehadiran', msg);
      }
      return;
    }

    const doSave = async () => {
      setIsSaving(true);
      try {
        for (const attendee of presentList) {
          await attendanceService.verifyAttendance(missionId, attendee.userId);
        }
        setAttendanceSaved(true);
        const msg = `✅ Kehadiran ${presentList.length} sukarelawan telah disahkan. Sijil akan dijana secara automatik.`;
        if (Platform.OS === 'web') {
          window.alert(msg);
        } else {
          Alert.alert('Berjaya! 🎉', msg);
        }
      } catch (err: any) {
        const msg = err?.message ?? 'Tidak dapat menyimpan kehadiran.';
        if (Platform.OS === 'web') {
          window.alert(msg);
        } else {
          Alert.alert('Ralat', msg);
        }
      } finally {
        setIsSaving(false);
      }
    };

    if (Platform.OS === 'web') {
      if (
        window.confirm(
          `${presentCount} sukarelawan akan disahkan hadir. Tindakan ini tidak boleh dibatalkan. Teruskan?`
        )
      ) {
        doSave();
      }
    } else {
      Alert.alert(
        'Sahkan Kehadiran',
        `${presentCount} sukarelawan akan disahkan hadir. Tindakan ini tidak boleh dibatalkan.`,
        [
          { text: 'Batal', style: 'cancel' },
          { text: 'Sahkan', onPress: doSave },
        ]
      );
    }
  };

  const handleConclude = async () => {
    const doConclude = async () => {
      setIsConcluding(true);
      try {
        await missionService.concludeMission(missionId);
        const msg = '🏁 Projek telah ditamatkan dan ditandakan sebagai selesai.';
        if (Platform.OS === 'web') {
          window.alert(msg);
        } else {
          Alert.alert('Projek Selesai! 🎉', msg);
        }
        navigation.goBack();
      } catch (err: any) {
        const msg = err?.message ?? 'Tidak dapat menamatkan projek.';
        if (Platform.OS === 'web') {
          window.alert(msg);
        } else {
          Alert.alert('Ralat', msg);
        }
      } finally {
        setIsConcluding(false);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Projek ini akan ditamatkan dan ditandakan sebagai selesai. Teruskan?')) {
        doConclude();
      }
    } else {
      Alert.alert(
        'Tamatkan Projek',
        'Projek ini akan ditamatkan dan ditandakan sebagai selesai. Tindakan ini tidak boleh dibatalkan.',
        [
          { text: 'Batal', style: 'cancel' },
          { text: 'Tamatkan', style: 'destructive', onPress: doConclude },
        ]
      );
    }
  };

  const renderAttendee = ({ item }: { item: AttendeeRow }) => (
    <TouchableOpacity
      style={styles.volunteerRow}
      onPress={() => togglePresence(item.userId)}
      activeOpacity={0.75}
    >
      <Avatar name={item.name} size={42} />
      <View style={styles.volunteerInfo}>
        <Text style={styles.volunteerName}>{item.name}</Text>
        <Text style={styles.volunteerSkill}>
          {item.skills ? `Kemahiran: ${item.skills}` : item.email}
        </Text>
      </View>
      <View style={[styles.checkbox, item.isPresent && styles.checkboxChecked]}>
        {item.isPresent && <Text style={styles.checkmark}>✓</Text>}
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backArrow}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tandakan Kehadiran</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Memuatkan senarai peserta...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tandakan Kehadiran</Text>
      </View>

      {/* Mission info */}
      <View style={styles.missionInfo}>
        <Text style={styles.missionTitle} numberOfLines={2}>{missionTitle}</Text>
        <Text style={styles.missionSub}>{attendees.length} sukarelawan berdaftar</Text>
      </View>

      {/* Stats bar */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statNum}>{String(attendees.length).padStart(2, '0')}</Text>
          <Text style={styles.statLabel}>Daftar</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statNum, { color: Colors.success }]}>
            {String(presentCount).padStart(2, '0')}
          </Text>
          <Text style={styles.statLabel}>Hadir</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statNum, { color: Colors.danger }]}>
            {String(absentCount).padStart(2, '0')}
          </Text>
          <Text style={styles.statLabel}>Tidak Hadir</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Cari nama sukarelawan..."
          placeholderTextColor={Colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Text style={styles.clearBtn}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Volunteer List */}
      <FlatList
        data={filteredAttendees}
        keyExtractor={(a) => a.userId}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={renderAttendee}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>
              {attendees.length === 0 ? '👥' : '🔍'}
            </Text>
            <Text style={styles.emptyText}>
              {attendees.length === 0
                ? 'Tiada sukarelawan berdaftar untuk misi ini.'
                : 'Tiada nama yang sepadan.'}
            </Text>
          </View>
        }
      />

      {/* Bottom action bar */}
      <View style={styles.bottomBar}>
        {attendanceSaved ? (
          <View style={styles.concludeSection}>
            <Text style={styles.concludeInfo}>
              ✅ Kehadiran telah disahkan. Adakah projek ini telah selesai?
            </Text>
            <View style={styles.concludeButtons}>
              <TouchableOpacity
                style={styles.concludeBackBtn}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.concludeBackBtnText}>Kembali</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.concludeBtn, isConcluding && styles.saveBtnDisabled]}
                onPress={handleConclude}
                disabled={isConcluding}
                activeOpacity={0.85}
              >
                {isConcluding ? (
                  <ActivityIndicator color={Colors.white} />
                ) : (
                  <Text style={styles.concludeBtnText}>🏁 Tamatkan Projek</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
            <View style={styles.progressRow}>
              <Text style={styles.progressText}>
                {presentCount} / {attendees.length} ditandakan hadir
              </Text>
              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: attendees.length > 0
                        ? `${(presentCount / attendees.length) * 100}%` as any
                        : '0%',
                    },
                  ]}
                />
              </View>
            </View>
            <TouchableOpacity
              style={[styles.saveBtn, (isSaving || presentCount === 0) && styles.saveBtnDisabled]}
              onPress={handleSave}
              disabled={isSaving || presentCount === 0}
              activeOpacity={0.85}
            >
              {isSaving ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.saveBtnText}>
                  ✅  Sahkan Kehadiran ({presentCount})
                </Text>
              )}
            </TouchableOpacity>
          </>
        )}
      </View>

      <LoadingOverlay visible={isSaving || isConcluding} message={isConcluding ? 'Menamatkan projek...' : 'Menyahkan kehadiran...'} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: { marginRight: Spacing.sm, padding: 4 },
  backArrow: { fontSize: 28, color: Colors.textPrimary, lineHeight: 32 },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  missionInfo: {
    padding: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  missionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  missionSub: { fontSize: FontSize.sm, color: Colors.textSecondary },
  statsBar: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statNum: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.extrabold,
    color: Colors.textPrimary,
  },
  statLabel: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: Colors.border },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    margin: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    height: 46,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, fontSize: FontSize.md, color: Colors.textPrimary },
  clearBtn: { fontSize: 14, color: Colors.textMuted, paddingHorizontal: 4 },
  list: { paddingHorizontal: Spacing.md, paddingBottom: 140 },
  emptyState: { alignItems: 'center', paddingTop: 48 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyText: {
    textAlign: 'center',
    color: Colors.textMuted,
    fontSize: FontSize.md,
  },
  volunteerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadow.sm,
  },
  volunteerInfo: { flex: 1, marginLeft: Spacing.sm },
  volunteerName: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  volunteerSkill: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
  },
  checkboxChecked: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  checkmark: { color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.md,
    paddingBottom: Spacing.lg,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    ...Shadow.lg,
  },
  progressRow: { marginBottom: Spacing.sm },
  progressText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  progressBarBg: {
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 4,
    backgroundColor: Colors.success,
    borderRadius: 2,
  },
  saveBtn: {
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
  saveBtnDisabled: {
    backgroundColor: Colors.textMuted,
    shadowOpacity: 0,
    elevation: 0,
  },
  saveBtnText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.white,
  },
  concludeSection: {
    gap: Spacing.sm,
  },
  concludeInfo: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  concludeButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  concludeBackBtn: {
    flex: 1,
    height: 52,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  concludeBackBtnText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  concludeBtn: {
    flex: 2,
    height: 52,
    backgroundColor: Colors.danger,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.danger,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  concludeBtnText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.white,
  },
});
