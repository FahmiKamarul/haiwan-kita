// src/screens/volunteer/MissionsSearchScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useMissions } from '../../hooks/useMissions';
import { MissionCard } from '../../components/MissionCard';
import { Colors } from '../../constants/colors';
import { BorderRadius, FontSize, FontWeight, Spacing } from '../../constants/theme';
import { MissionCategory, MissionState, VolunteerStackParamList } from '../../types';

type Nav = StackNavigationProp<VolunteerStackParamList>;

const STATES: { label: string; value: MissionState | undefined }[] = [
  { label: 'Semua Aktif', value: 'ACTIVE' },
  { label: 'Selesai', value: 'COMPLETED' },
];

const CATEGORIES: { label: string; emoji: string; value: MissionCategory | undefined }[] = [
  { label: 'Semua', emoji: '🐾', value: undefined },
  { label: 'Penyelamat', emoji: '🚨', value: 'RESCUE' },
  { label: 'Pengambilan', emoji: '🏠', value: 'ADOPTION' },
  { label: 'Perubatan', emoji: '💉', value: 'MEDICAL' },
  { label: 'Pemakanan', emoji: '🍖', value: 'FEEDING' },
];

export function MissionsSearchScreen() {
  const navigation = useNavigation<Nav>();
  const [searchText, setSearchText] = useState('');
  const [activeState, setActiveState] = useState<MissionState | undefined>('ACTIVE');
  const [activeCategory, setActiveCategory] = useState<MissionCategory | undefined>(undefined);

  const { missions, isLoading, isRefreshing, loadMore, refresh, setParams } = useMissions({
    state: 'ACTIVE',
  });

  const handleSearch = () => {
    setParams({
      search: searchText.trim() || undefined,
      state: activeState,
      category: activeCategory,
    });
  };

  const applyState = (val: MissionState | undefined) => {
    setActiveState(val);
    setParams({ search: searchText.trim() || undefined, state: val, category: activeCategory });
  };

  const applyCategory = (val: MissionCategory | undefined) => {
    setActiveCategory(val);
    setParams({ search: searchText.trim() || undefined, state: activeState, category: val });
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Cari misi, lokasi..."
          placeholderTextColor={Colors.textMuted}
          value={searchText}
          onChangeText={setSearchText}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => { setSearchText(''); handleSearch(); }}>
            <Text style={styles.clearBtn}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* State filter chips */}
      <View style={styles.chipRow}>
        {STATES.map((s) => (
          <TouchableOpacity
            key={String(s.value)}
            style={[styles.chip, activeState === s.value && styles.chipActive]}
            onPress={() => applyState(s.value)}
          >
            <Text style={[styles.chipText, activeState === s.value && styles.chipTextActive]}>
              {s.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Category filter */}
      <View style={styles.chipRow}>
        {CATEGORIES.map((c) => (
          <TouchableOpacity
            key={String(c.value)}
            style={[styles.chip, activeCategory === c.value && styles.chipActive]}
            onPress={() => applyCategory(c.value)}
          >
            <Text style={styles.chipEmoji}>{c.emoji}</Text>
            <Text style={[styles.chipText, activeCategory === c.value && styles.chipTextActive]}>
              {c.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Results */}
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
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🔍</Text>
              <Text style={styles.emptyTitle}>Tiada Hasil</Text>
              <Text style={styles.emptyBody}>Cuba kata kunci atau penapis yang berbeza.</Text>
            </View>
          )
        }
        renderItem={({ item }) => (
          <MissionCard
            mission={item}
            onPress={() =>
              navigation.navigate('MissionDetail', { missionId: item.id })
            }
            showJoinButton={false}
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    margin: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    height: 50,
  },
  searchIcon: { fontSize: 16, marginRight: Spacing.sm },
  searchInput: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  clearBtn: {
    fontSize: 16,
    color: Colors.textMuted,
    paddingHorizontal: 4,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.md,
    gap: 8,
    marginBottom: Spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipEmoji: { fontSize: 12, marginRight: 4 },
  chipText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
  },
  chipTextActive: { color: Colors.white },
  list: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.xxl },
  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyEmoji: { fontSize: 48, marginBottom: Spacing.md },
  emptyTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  emptyBody: { fontSize: FontSize.sm, color: Colors.textSecondary },
});
