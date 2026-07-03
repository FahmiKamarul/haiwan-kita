// src/screens/admin/AdminProjectsScreen.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useMissions } from '../../hooks/useMissions';
import { MissionCard } from '../../components/MissionCard';
import { AdminStackParamList } from '../../types';
import { Colors } from '../../constants/colors';
import { BorderRadius, FontSize, FontWeight, Spacing } from '../../constants/theme';

type Nav = StackNavigationProp<AdminStackParamList>;

export function AdminProjectsScreen() {
  const navigation = useNavigation<Nav>();
  const { missions, isLoading, isRefreshing, refresh, loadMore } = useMissions({ limit: 10 });

  const pending = missions.filter((m) => m.state === 'UPCOMING').length;
  const active = missions.filter((m) => m.state === 'ACTIVE').length;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Semua Projek</Text>
      </View>

      {/* Quick stats */}
      <View style={styles.statsRow}>
        <View style={[styles.statChip, { backgroundColor: Colors.warningLight }]}>
          <Text style={[styles.statChipNum, { color: Colors.warning }]}>{pending}</Text>
          <Text style={styles.statChipLabel}>Menunggu</Text>
        </View>
        <View style={[styles.statChip, { backgroundColor: Colors.successLight }]}>
          <Text style={[styles.statChipNum, { color: Colors.success }]}>{active}</Text>
          <Text style={styles.statChipLabel}>Aktif</Text>
        </View>
        <View style={[styles.statChip, { backgroundColor: Colors.infoLight }]}>
          <Text style={[styles.statChipNum, { color: Colors.info }]}>{missions.length}</Text>
          <Text style={styles.statChipLabel}>Jumlah</Text>
        </View>
      </View>

      <FlatList
        data={missions}
        keyExtractor={(m) => m.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshing={isRefreshing}
        onRefresh={refresh}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />
          ) : (
            <Text style={styles.emptyText}>Tiada projek dijumpai.</Text>
          )
        }
        renderItem={({ item }) => (
          <MissionCard
            mission={item}
            showJoinButton={false}
            onPress={() => {
              if (item.state === 'UPCOMING') {
                navigation.navigate('ReviewProject', {
                  projectId: item.id,
                  projectTitle: item.title,
                });
              } else {
                navigation.navigate('MissionDetail', { missionId: item.id });
              }
            }}
          />
        )}
        ListFooterComponent={
          isLoading && missions.length > 0 ? (
            <ActivityIndicator color={Colors.primary} style={{ marginVertical: 16 }} />
          ) : null
        }
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
  title: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  statsRow: {
    flexDirection: 'row',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  statChip: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.sm,
    alignItems: 'center',
  },
  statChipNum: { fontSize: FontSize.xxl, fontWeight: FontWeight.extrabold },
  statChipLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  list: { paddingHorizontal: Spacing.md, paddingBottom: 40 },
  emptyText: { textAlign: 'center', color: Colors.textMuted, paddingTop: 40, fontSize: FontSize.md },
});
