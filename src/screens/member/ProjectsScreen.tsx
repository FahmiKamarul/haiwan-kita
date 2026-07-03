// src/screens/member/ProjectsScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useMissions } from '../../hooks/useMissions';
import { MissionCard } from '../../components/MissionCard';
import { MemberStackParamList } from '../../types';
import { Colors } from '../../constants/colors';
import { BorderRadius, FontSize, FontWeight, Spacing } from '../../constants/theme';

type TabType = 'AKTIF' | 'SEJARAH';

type Nav = StackNavigationProp<MemberStackParamList>;

export function MemberProjectsScreen() {
  const navigation = useNavigation<Nav>();
  const [activeTab, setActiveTab] = useState<TabType>('AKTIF');

  const getStatesForTab = (tab: TabType) => {
    return tab === 'AKTIF' ? 'UPCOMING,ACTIVE' : 'COMPLETED,CANCELLED';
  };

  const { missions, isLoading, isRefreshing, refresh, loadMore, setParams } = useMissions({
    limit: 10,
    state: getStatesForTab(activeTab),
  });

  useEffect(() => {
    setParams({ state: getStatesForTab(activeTab) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Semua Projek</Text>
      </View>
      
      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'AKTIF' && styles.tabButtonActive]}
          onPress={() => setActiveTab('AKTIF')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, activeTab === 'AKTIF' && styles.tabTextActive]}>
            Aktif
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'SEJARAH' && styles.tabButtonActive]}
          onPress={() => setActiveTab('SEJARAH')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, activeTab === 'SEJARAH' && styles.tabTextActive]}>
            Sejarah
          </Text>
        </TouchableOpacity>
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
            <Text style={styles.emptyText}>
              {activeTab === 'AKTIF' ? 'Tiada projek aktif dijumpai.' : 'Tiada sejarah projek dijumpai.'}
            </Text>
          )
        }
        renderItem={({ item }) => (
          <MissionCard 
            mission={item} 
            showJoinButton={false} 
            onPress={() => navigation.navigate('MissionDetail', { missionId: item.id })}
          />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    padding: Spacing.md,
    backgroundColor: Colors.white,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tabButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textMuted,
  },
  tabTextActive: {
    color: Colors.primary,
  },
  list: { padding: Spacing.md, paddingBottom: 40 },
  emptyText: {
    textAlign: 'center',
    color: Colors.textMuted,
    paddingTop: 40,
    fontSize: FontSize.md,
  },
});
