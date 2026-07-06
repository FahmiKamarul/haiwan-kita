import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import api from '../../lib/api';
import { Colors } from '../../constants/colors';
import { BorderRadius, FontSize, FontWeight, Shadow, Spacing } from '../../constants/theme';

export function AdminReportsScreen() {
  const navigation = useNavigation();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [reviewStats, setReviewStats] = useState<any>(null);

  const fetchReviewStats = async () => {
    try {
      const res = await api.get(`/api/v1/admin/reviews/stats`);
      setReviewStats(res.data.data);
    } catch (e) {
      console.error('Failed to fetch review stats', e);
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await fetchReviewStats();
    setIsRefreshing(false);
  };

  useEffect(() => {
    fetchReviewStats();
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Laporan & Analitik</Text>
      </View>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
      >
        <Text style={styles.desc}>
          Lihat statistik dan metrik prestasi keseluruhan projek Haiwan Kita.
        </Text>

        {/* Review Stats */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Statistik Maklum Balas</Text>
        </View>

        {reviewStats ? (
          <>
            <View style={{ flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.xl }}>
              <View style={[styles.statCard, { backgroundColor: '#FFF8E1' }]}>
                <Text style={[styles.statNum, { color: '#F59E0B' }]}>{reviewStats.platformAverage.toFixed(1)}</Text>
                <Text style={styles.statLabel}>PURATA KESELURUHAN</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: '#E3F2FD' }]}>
                <Text style={[styles.statNum, { color: '#1976D2' }]}>{reviewStats.totalReviews}</Text>
                <Text style={styles.statLabel}>JUMLAH ULASAN</Text>
              </View>
            </View>

            {/* Recent Comments */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Ulasan Terkini Sukarelawan</Text>
            </View>
            
            {reviewStats.recentComments && reviewStats.recentComments.length > 0 ? (
              reviewStats.recentComments.map((review: any, index: number) => (
                <View key={review.id || index} style={styles.commentCard}>
                  <View style={styles.commentHeader}>
                    <Text style={styles.commentAuthor}>{review.user?.name || 'Sukarelawan'}</Text>
                    <Text style={styles.commentProject}>{review.project?.title || 'Projek Tidak Diketahui'}</Text>
                  </View>
                  <Text style={styles.commentRating}>★ {review.overallRating?.toFixed(1) || '0.0'} / 5.0</Text>
                  {review.comment ? (
                    <Text style={styles.commentText}>"{review.comment}"</Text>
                  ) : (
                    <Text style={[styles.commentText, { fontStyle: 'italic', color: Colors.textMuted }]}>
                      (Hanya memberikan penilaian bintang)
                    </Text>
                  )}
                </View>
              ))
            ) : (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>Tiada ulasan terkini.</Text>
              </View>
            )}
          </>
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>Sedang memuat turun data statistik...</Text>
          </View>
        )}
      </ScrollView>
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
  content: { padding: Spacing.md },
  desc: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: Spacing.xl },
  sectionHeader: { marginBottom: Spacing.sm },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  statCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    ...Shadow.sm,
    marginBottom: Spacing.xl,
  },
  statNum: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.extrabold,
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
  emptyCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    ...Shadow.sm,
  },
  emptyText: { fontSize: FontSize.sm, color: Colors.textMuted },
  commentCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadow.sm,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  commentAuthor: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  commentProject: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    backgroundColor: Colors.background,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  commentRating: {
    fontSize: FontSize.sm,
    color: '#F59E0B',
    fontWeight: FontWeight.semibold,
    marginBottom: Spacing.sm,
  },
  commentText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 20,
  },
});
