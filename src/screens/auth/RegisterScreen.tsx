// src/screens/auth/RegisterScreen.tsx — Rajah 3.17 (Volunteer) & 3.18 (Member)
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../../context/AuthContext';
import { AuthStackParamList } from '../../types';
import { Colors } from '../../constants/colors';
import {
  BorderRadius,
  FontSize,
  FontWeight,
  Spacing,
} from '../../constants/theme';

type Nav = StackNavigationProp<AuthStackParamList, 'Register'>;
type Role = 'VOLUNTEER' | 'MEMBER';

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  skills?: string;
  password?: string;
}

export function RegisterScreen() {
  const navigation = useNavigation<Nav>();
  const { register } = useAuth();

  const [role, setRole] = useState<Role>('VOLUNTEER');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [skills, setSkills] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const clearErr = (field: keyof FormErrors) =>
    setErrors((e) => ({ ...e, [field]: undefined }));

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!name.trim() || name.trim().length < 2) e.name = 'Nama sekurang-kurangnya 2 huruf.';
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      e.email = 'Masukkan e-mel yang sah.';
    if (phone && !/^\+?[0-9]{10,15}$/.test(phone.replace(/\s/g, '')))
      e.phone = 'Format: +60123456789 (10–15 digit)';
    if (!password || password.length < 8) e.password = 'Kata laluan sekurang-kurangnya 8 aksara.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setIsLoading(true);
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        role,
        phone: phone.trim() || undefined,
        skills: role === 'VOLUNTEER' ? skills.trim() || undefined : undefined,
      });
      // RootNavigator re-renders on auth state change
    } catch (err: any) {
      if (err?.status === 422 && err.details) {
        const d = err.details as Record<string, string[]>;
        setErrors({
          name: d.name?.[0],
          email: d.email?.[0],
          phone: d.phone?.[0],
          password: d.password?.[0],
        });
      } else if (err?.status === 409) {
        Alert.alert('E-mel Sudah Digunakan', 'Akaun dengan e-mel ini sudah wujud.');
      } else {
        Alert.alert('Ralat Pendaftaran', err?.message ?? 'Sila cuba lagi.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <Text style={styles.title}>Cipta Akaun</Text>
          <Text style={styles.subtitle}>
            Sertai komuniti SAFM dan mula membantu.
          </Text>

          {/* Role Toggle — Rajah 3.17 / 3.18 */}
          <Text style={styles.sectionLabel}>PILIH PERANAN ANDA</Text>
          <View style={styles.roleRow}>
            <TouchableOpacity
              style={[
                styles.roleBtn,
                role === 'VOLUNTEER' && styles.roleBtnActive,
              ]}
              onPress={() => setRole('VOLUNTEER')}
            >
              <Text
                style={[
                  styles.roleBtnText,
                  role === 'VOLUNTEER' && styles.roleBtnTextActive,
                ]}
              >
                Sukarelawan
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.roleBtn,
                role === 'MEMBER' && styles.roleBtnActive,
              ]}
              onPress={() => setRole('MEMBER')}
            >
              <Text
                style={[
                  styles.roleBtnText,
                  role === 'MEMBER' && styles.roleBtnTextActive,
                ]}
              >
                Ahli
              </Text>
            </TouchableOpacity>
          </View>

          {/* Member fee note */}
          {role === 'MEMBER' && (
            <View style={styles.memberNote}>
              <Text style={styles.memberNoteIcon}>⚠️</Text>
              <Text style={styles.memberNoteText}>
                Nota: Ahli Persatuan dikehendaki membayar yuran tahunan sebanyak RM50.00
              </Text>
            </View>
          )}

          {/* Full Name */}
          <Text style={styles.fieldLabel}>NAMA PENUH</Text>
          <TextInput
            style={[styles.input, errors.name && styles.inputError]}
            placeholder="cth. Fahmi"
            placeholderTextColor={Colors.textMuted}
            value={name}
            onChangeText={(t) => { setName(t); clearErr('name'); }}
            autoCapitalize="words"
            returnKeyType="next"
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

          {/* Email */}
          <Text style={styles.fieldLabel}>ALAMAT E-MEL</Text>
          <TextInput
            style={[styles.input, errors.email && styles.inputError]}
            placeholder="fahmi@contoh.com"
            placeholderTextColor={Colors.textMuted}
            value={email}
            onChangeText={(t) => { setEmail(t); clearErr('email'); }}
            autoCapitalize="none"
            keyboardType="email-address"
            returnKeyType="next"
            textContentType="emailAddress"
          />
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

          {/* Phone */}
          <Text style={styles.fieldLabel}>NOMBOR TELEFON</Text>
          <TextInput
            style={[styles.input, errors.phone && styles.inputError]}
            placeholder="012-3456789"
            placeholderTextColor={Colors.textMuted}
            value={phone}
            onChangeText={(t) => { setPhone(t); clearErr('phone'); }}
            keyboardType="phone-pad"
            returnKeyType="next"
          />
          {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}

          {/* Skills — Volunteer only */}
          {role === 'VOLUNTEER' && (
            <>
              <Text style={styles.fieldLabel}>KEMAHIRAN / SKILLS</Text>
              <TextInput
                style={[styles.input, errors.skills && styles.inputError]}
                placeholder="cth. Pertolongan Cemas Haiwan, Logistik, Fotografi"
                placeholderTextColor={Colors.textMuted}
                value={skills}
                onChangeText={(t) => { setSkills(t); clearErr('skills'); }}
                returnKeyType="next"
              />
              {errors.skills && <Text style={styles.errorText}>{errors.skills}</Text>}
            </>
          )}

          {/* Password */}
          <Text style={styles.fieldLabel}>KATA LALUAN</Text>
          <TextInput
            style={[styles.input, errors.password && styles.inputError]}
            placeholder="Cipta kata laluan yang kukuh"
            placeholderTextColor={Colors.textMuted}
            value={password}
            onChangeText={(t) => { setPassword(t); clearErr('password'); }}
            secureTextEntry
            returnKeyType="done"
            onSubmitEditing={handleRegister}
            textContentType="newPassword"
          />
          {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

          {/* Submit */}
          <TouchableOpacity
            style={[styles.btn, isLoading && styles.btnDisabled]}
            onPress={handleRegister}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            {isLoading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.btnText}>Cipta Akaun</Text>
            )}
          </TouchableOpacity>

          {/* Login link */}
          <View style={styles.loginRow}>
            <Text style={styles.loginLabel}>Sudah ada akaun? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Log Masuk</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  scroll: {
    flexGrow: 1,
    padding: Spacing.lg,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xxl,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  sectionLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.textMuted,
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
  },
  roleRow: {
    flexDirection: 'row',
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  roleBtn: {
    flex: 1,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
  },
  roleBtnActive: {
    backgroundColor: Colors.primary,
  },
  roleBtnText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.primary,
  },
  roleBtnTextActive: {
    color: Colors.white,
  },
  memberNote: {
    flexDirection: 'row',
    backgroundColor: Colors.primaryLight,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
    alignItems: 'flex-start',
  },
  memberNoteIcon: { fontSize: 14, marginRight: 6 },
  memberNoteText: {
    flex: 1,
    fontSize: FontSize.xs,
    color: Colors.primaryDark,
    lineHeight: 22,
  },
  fieldLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    letterSpacing: 0.5,
    marginTop: Spacing.sm,
    marginBottom: 5,
  },
  input: {
    height: 48,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    backgroundColor: Colors.background,
  },
  inputError: { borderColor: Colors.danger },
  errorText: {
    fontSize: FontSize.xs,
    color: Colors.danger,
    marginTop: 3,
  },
  btn: {
    height: 52,
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
  btnDisabled: { opacity: 0.7 },
  btnText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.white,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.lg,
  },
  loginLabel: { fontSize: FontSize.sm, color: Colors.textSecondary },
  loginLink: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
  },
});
