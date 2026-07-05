import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { VolunteerStackParamList } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Colors } from '../../constants/colors';
import { BorderRadius, FontSize, FontWeight, Shadow, Spacing } from '../../constants/theme';
import api from '../../lib/api';

type SubmitReviewRouteProp = RouteProp<VolunteerStackParamList, 'SubmitReview'>;

export function SubmitReviewScreen() {
  const navigation = useNavigation();
  const route = useRoute<SubmitReviewRouteProp>();
  const { token } = useAuth();
  
  const { projectId, projectTitle } = route.params;

  const [ratingManagement, setRatingManagement] = useState(0);
  const [ratingSafety, setRatingSafety] = useState(0);
  const [ratingImpact, setRatingImpact] = useState(0);
  const [ratingFacility, setRatingFacility] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const StarRating = ({ label, value, onChange }: { label: string, value: number, onChange: (v: number) => void }) => (
    <View style={styles.ratingRow}>
      <Text style={styles.ratingLabel}>{label}</Text>
      <View style={styles.stars}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity key={star} onPress={() => onChange(star)} style={styles.starBtn}>
            <Text style={[styles.starText, { color: star <= value ? '#F59E0B' : Colors.border }]}>
              ★
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const handleSubmit = async () => {
    if (!ratingManagement || !ratingSafety || !ratingImpact || !ratingFacility) {
      Alert.alert('Ralat', 'Sila berikan semua rating bintang.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ratingManagement,
        ratingSafety,
        ratingImpact,
        ratingFacility,
        comment: comment.trim() || undefined,
      };
      
      const res = await api.post(`/api/v1/missions/${projectId}/reviews`, payload);
      
      if (res.status !== 200 && res.status !== 201) {
        throw new Error('Gagal menghantar ulasan.');
      }

      Alert.alert('Berjaya', 'Maklum balas anda telah direkodkan. Terima kasih!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (err: any) {
      Alert.alert('Ralat', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>‹ Kembali</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Beri Maklum Balas</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.missionTitle}>{projectTitle}</Text>
          <Text style={styles.desc}>
            Bantu kami meningkatkan kualiti misi dengan memberikan maklum balas yang jujur.
          </Text>

          <View style={styles.ratingsContainer}>
            <StarRating label="Pengurusan & Arahan" value={ratingManagement} onChange={setRatingManagement} />
            <StarRating label="Keselamatan & Panduan" value={ratingSafety} onChange={setRatingSafety} />
            <StarRating label="Impak & Kepuasan" value={ratingImpact} onChange={setRatingImpact} />
            <StarRating label="Kemudahan & Lokasi" value={ratingFacility} onChange={setRatingFacility} />
          </View>

          <Text style={styles.label}>Komen / Cadangan (Pilihan)</Text>
          <TextInput
            style={styles.input}
            multiline
            numberOfLines={4}
            placeholder="Kongsikan pengalaman anda secara terperinci..."
            value={comment}
            onChangeText={setComment}
            textAlignVertical="top"
          />

          <TouchableOpacity 
            style={[styles.submitBtn, isSubmitting && { opacity: 0.7 }]} 
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.submitText}>Hantar Maklum Balas</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: { padding: 4 },
  backText: { fontSize: FontSize.md, color: Colors.primary },
  title: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  content: { padding: Spacing.md },
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    ...Shadow.sm,
  },
  missionTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginBottom: Spacing.xs },
  desc: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: Spacing.lg, lineHeight: 20 },
  ratingsContainer: { marginBottom: Spacing.xl },
  ratingRow: { marginBottom: Spacing.md },
  ratingLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textPrimary, marginBottom: 8 },
  stars: { flexDirection: 'row', gap: 10 },
  starBtn: { padding: 2 },
  starText: { fontSize: 32 },
  label: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textPrimary, marginBottom: 8 },
  input: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    minHeight: 120,
    marginBottom: Spacing.xl,
  },
  submitBtn: {
    backgroundColor: Colors.primary,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  submitText: { color: Colors.white, fontSize: FontSize.md, fontWeight: FontWeight.bold },
});
