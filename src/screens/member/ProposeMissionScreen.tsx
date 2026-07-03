// src/screens/member/ProposeMissionScreen.tsx — Rajah 3.24
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { missionService } from '../../services/missionService';
import { MemberStackParamList, MissionCategory } from '../../types';
import { Colors } from '../../constants/colors';
import { BorderRadius, FontSize, FontWeight, Spacing } from '../../constants/theme';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import DateTimePicker from '@react-native-community/datetimepicker';

type Nav = StackNavigationProp<MemberStackParamList>;

interface FormState {
  title: string;
  category: MissionCategory;
  startDate: string;
  requiredVolunteers: string;
  location: string;
  description: string;
}

interface FormErrors {
  title?: string;
  startDate?: string;
  requiredVolunteers?: string;
  location?: string;
  description?: string;
}

const CATEGORIES: { label: string; value: MissionCategory }[] = [
  { label: 'Rescue Operation', value: 'RESCUE' },
  { label: 'Adoption Drive', value: 'ADOPTION' },
  { label: 'Medical Support', value: 'MEDICAL' },
  { label: 'Awareness Campaign', value: 'AWARENESS' },
  { label: 'Feeding Program', value: 'FEEDING' },
  { label: 'Other', value: 'OTHER' },
];

export function ProposeMissionScreen() {
  const navigation = useNavigation<Nav>();

  const [form, setForm] = useState<FormState>({
    title: '',
    category: 'RESCUE',
    startDate: '',
    requiredVolunteers: '20',
    location: '',
    description: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const set = (field: keyof FormState) => (val: string) => {
    setForm((f) => ({ ...f, [field]: val }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!form.title.trim() || form.title.trim().length < 5)
      e.title = 'Nama projek sekurang-kurangnya 5 huruf.';
    if (!form.startDate.trim())
      e.startDate = 'Tarikh diperlukan.';
    else if (!/^\d{4}-\d{2}-\d{2}/.test(form.startDate))
      e.startDate = 'Format: YYYY-MM-DD';
    const volunteers = parseInt(form.requiredVolunteers, 10);
    if (isNaN(volunteers) || volunteers < 1 || volunteers > 200)
      e.requiredVolunteers = 'Masukkan bilangan antara 1–200.';
    if (!form.location.trim() || form.location.trim().length < 3)
      e.location = 'Lokasi diperlukan.';
    if (!form.description.trim() || form.description.trim().length < 20)
      e.description = 'Huraian sekurang-kurangnya 20 aksara.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      await missionService.createMission({
        title: form.title.trim(),
        category: form.category,
        startDate: new Date(form.startDate).toISOString(),
        location: form.location.trim(),
        description: form.description.trim(),
        requiredVolunteers: parseInt(form.requiredVolunteers, 10),
      });
      Alert.alert(
        'Permohonan Dihantar! ✅',
        'Cadangan misi anda telah dihantar dan sedang menunggu kelulusan pentadbir.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (err: any) {
      if (err?.status === 422 && err.details) {
        const d = err.details as Record<string, string[]>;
        setErrors({
          title: d.title?.[0],
          startDate: d.startDate?.[0],
          location: d.location?.[0],
          description: d.description?.[0],
          requiredVolunteers: d.requiredVolunteers?.[0],
        });
      } else if (err?.status === 403) {
        Alert.alert('Tidak Dibenarkan', 'Hanya Ahli Persatuan yang boleh mencadangkan misi.');
      } else {
        Alert.alert('Penghantaran Gagal', err?.message ?? 'Sila cuba lagi.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCatLabel =
    CATEGORIES.find((c) => c.value === form.category)?.label ?? 'Rescue Operation';

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Propose New Mission</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >
        {/* Section label */}
        <Text style={styles.sectionLabel}>PROJECT SPECIFICATIONS</Text>

        {/* Project Name */}
        <Text style={styles.fieldLabel}>PROJECT NAME</Text>
        <View style={[styles.inputRow, errors.title && styles.inputRowError]}>
          <Text style={styles.inputIcon}>🐾</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Stray Feeding Drive"
            placeholderTextColor={Colors.textMuted}
            value={form.title}
            onChangeText={set('title')}
            returnKeyType="next"
          />
        </View>
        {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}

        {/* Activity Category */}
        <Text style={styles.fieldLabel}>ACTIVITY CATEGORY</Text>
        <TouchableOpacity
          style={styles.selectRow}
          onPress={() => setShowCategoryPicker((v) => !v)}
          activeOpacity={0.8}
        >
          <Text style={styles.inputIcon}>≡</Text>
          <Text style={styles.selectText}>{selectedCatLabel}</Text>
          <Text style={styles.selectChevron}>{showCategoryPicker ? '▲' : '▼'}</Text>
        </TouchableOpacity>
        {showCategoryPicker && (
          <View style={styles.dropdown}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.value}
                style={[
                  styles.dropdownItem,
                  form.category === cat.value && styles.dropdownItemActive,
                ]}
                onPress={() => {
                  set('category')(cat.value);
                  setShowCategoryPicker(false);
                }}
              >
                <Text
                  style={[
                    styles.dropdownItemText,
                    form.category === cat.value && styles.dropdownItemTextActive,
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Date + Volunteers row */}
        <View style={styles.twoColRow}>
          <View style={styles.halfCol}>
            <Text style={styles.fieldLabel}>DATE</Text>
            <View style={[styles.inputRow, errors.startDate && styles.inputRowError]}>
              <Text style={styles.inputIcon}>📅</Text>
              {Platform.OS === 'web' ? (
                React.createElement('input', {
                  type: 'date',
                  value: form.startDate,
                  onChange: (e: any) => set('startDate')(e.target.value),
                  style: {
                    flex: 1,
                    fontSize: FontSize.md,
                    color: Colors.textPrimary,
                    border: 'none',
                    outline: 'none',
                    backgroundColor: 'transparent',
                    fontFamily: 'inherit',
                  },
                })
              ) : (
                <TouchableOpacity
                  style={{ flex: 1, justifyContent: 'center' }}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={[styles.input, { marginTop: 14 }, !form.startDate && { color: Colors.textMuted }]}>
                    {form.startDate || 'YYYY-MM-DD'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            {showDatePicker && Platform.OS !== 'web' && (
              <DateTimePicker
                value={form.startDate ? new Date(form.startDate) : new Date()}
                mode="date"
                display="default"
                minimumDate={new Date()}
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) {
                    const formatted = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
                    set('startDate')(formatted);
                  }
                }}
              />
            )}
            {errors.startDate && <Text style={styles.errorText}>{errors.startDate}</Text>}
          </View>

          <View style={styles.halfCol}>
            <Text style={styles.fieldLabel}>VOLUNTEERS</Text>
            <View style={[styles.inputRow, errors.requiredVolunteers && styles.inputRowError]}>
              <Text style={styles.inputIcon}>👥</Text>
              <TextInput
                style={styles.input}
                placeholder="20"
                placeholderTextColor={Colors.textMuted}
                value={form.requiredVolunteers}
                onChangeText={set('requiredVolunteers')}
                keyboardType="number-pad"
                returnKeyType="next"
              />
            </View>
            {errors.requiredVolunteers && (
              <Text style={styles.errorText}>{errors.requiredVolunteers}</Text>
            )}
          </View>
        </View>

        {/* Geographic Location */}
        <Text style={styles.fieldLabel}>GEOGRAPHIC LOCATION</Text>
        <View style={[styles.inputRow, errors.location && styles.inputRowError]}>
          <Text style={styles.inputIcon}>📍</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Mentakab, Pahang"
            placeholderTextColor={Colors.textMuted}
            value={form.location}
            onChangeText={set('location')}
            returnKeyType="next"
          />
        </View>
        {errors.location && <Text style={styles.errorText}>{errors.location}</Text>}

        {/* Description */}
        <Text style={styles.fieldLabel}>DESCRIPTION OF TASKS</Text>
        <View style={[styles.textAreaWrapper, errors.description && styles.inputRowError]}>
          <TextInput
            style={styles.textArea}
            placeholder="Outline the mission objectives and volunteer responsibilities..."
            placeholderTextColor={Colors.textMuted}
            value={form.description}
            onChangeText={set('description')}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />
        </View>
        {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
          activeOpacity={0.85}
        >
          {isSubmitting ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.submitBtnText}>Hantar Permohonan (Submit Proposal)</Text>
          )}
        </TouchableOpacity>

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>

      <LoadingOverlay visible={isSubmitting} message="Menghantar permohonan..." />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: { marginRight: Spacing.sm, padding: 4 },
  backArrow: { fontSize: 22, color: Colors.textPrimary },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  scrollContent: { padding: Spacing.lg },
  sectionLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
    letterSpacing: 1,
    marginBottom: Spacing.md,
  },
  fieldLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 6,
    marginTop: Spacing.md,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.sm,
    height: 48,
    backgroundColor: Colors.white,
  },
  inputRowError: { borderColor: Colors.danger },
  inputIcon: { fontSize: 15, marginRight: 8, color: Colors.textMuted },
  input: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  selectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.sm,
    height: 48,
    backgroundColor: Colors.white,
  },
  selectText: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  selectChevron: { fontSize: 12, color: Colors.textMuted },
  dropdown: {
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    marginTop: 2,
    overflow: 'hidden',
    zIndex: 999,
  },
  dropdownItem: {
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  dropdownItemActive: { backgroundColor: Colors.primaryLight },
  dropdownItemText: { fontSize: FontSize.md, color: Colors.textPrimary },
  dropdownItemTextActive: { color: Colors.primary, fontWeight: FontWeight.semibold },
  twoColRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  halfCol: { flex: 1 },
  textAreaWrapper: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.white,
    padding: Spacing.sm,
    minHeight: 120,
  },
  textArea: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    minHeight: 100,
  },
  errorText: {
    fontSize: FontSize.xs,
    color: Colors.danger,
    marginTop: 3,
  },
  submitBtn: {
    height: 54,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.xl,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnDisabled: { opacity: 0.7 },
  submitBtnText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.white,
  },
});
