// src/screens/member/SettingsScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Platform,
  Modal,
  TextInput,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../../components/Avatar';
import { Colors } from '../../constants/colors';
import { BorderRadius, FontSize, FontWeight, Shadow, Spacing } from '../../constants/theme';
import { authService } from '../../services/authService';

interface SettingRowProps {
  icon: string;
  label: string;
  onPress?: () => void;
  danger?: boolean;
  rightText?: string;
}

function SettingRow({ icon, label, onPress, danger, rightText }: SettingRowProps) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.rowIcon}>{icon}</Text>
      <Text style={[styles.rowLabel, danger && { color: Colors.danger }]}>{label}</Text>
      {rightText && <Text style={styles.rightText}>{rightText}</Text>}
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
}

export function MemberSettingsScreen() {
  const { user, logout, updateProfile, payMembership } = useAuth();

  // Profile Modal State
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileName, setProfileName] = useState(user?.name ?? '');
  const [profilePhone, setProfilePhone] = useState(user?.phone ?? '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Password Modal State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  // Billing Modal State
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [isPaying, setIsPaying] = useState(false);

  // Sync state when user changes (e.g. from server)
  useEffect(() => {
    if (user) {
      setProfileName(user.name ?? '');
      setProfilePhone(user.phone ?? '');
    }
  }, [user]);

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

  const handleSaveProfile = async () => {
    if (!profileName.trim()) {
      Alert.alert('Ralat', 'Nama tidak boleh dikosongkan.');
      return;
    }
    setIsSavingProfile(true);
    try {
      await updateProfile({
        name: profileName,
        phone: profilePhone,
      });
      setShowProfileModal(false);
      Alert.alert('Berjaya! 🎉', 'Profil anda telah berjaya dikemaskini.');
    } catch (err: any) {
      Alert.alert('Ralat', err?.message ?? 'Gagal mengemaskini profil.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSavePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Ralat', 'Sila isi semua medan kata laluan.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Ralat', 'Kata laluan baru dan pengesahan kata laluan tidak sepadan.');
      return;
    }
    if (newPassword.length < 8) {
      Alert.alert('Ralat', 'Kata laluan baru mestilah sekurang-kurangnya 8 aksara.');
      return;
    }
    setIsSavingPassword(true);
    try {
      await authService.updatePassword({
        currentPassword,
        newPassword,
      });
      setShowPasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      Alert.alert('Berjaya! 🎉', 'Kata laluan anda telah berjaya ditukar.');
    } catch (err: any) {
      Alert.alert('Ralat', err?.message ?? 'Gagal menukar kata laluan.');
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handlePayMembership = async () => {
    setIsPaying(true);
    try {
      await payMembership();
      // Succesfully paid, membership status updates in Context
    } catch (err: any) {
      Alert.alert('Ralat Pembayaran', err?.message ?? 'Gagal memproses simulasi pembayaran.');
    } finally {
      setIsPaying(false);
    }
  };

  const handleToggleNotifications = () => {
    Alert.alert('Pemberitahuan', 'Pemberitahuan push telah berjaya diaktifkan.');
  };

  const handleSelectLanguage = () => {
    Alert.alert('Bahasa / Language', 'Bahasa semasa: Bahasa Melayu (ms-MY)');
  };

  const handleAboutApp = () => {
    Alert.alert(
      'Tentang Aplikasi',
      'Haiwan Kita v1.0.0\n\nAplikasi rasmi Persatuan Haiwan Malaysia (SAFM) untuk koordinasi sukarelawan & menyelamat haiwan.'
    );
  };

  const memberProfile = user?.memberProfile;
  const isPaid = memberProfile?.paymentStatus === 'PAID';

  const expiryDateFormatted = memberProfile?.membershipExpiry
    ? new Date(memberProfile.membershipExpiry).toLocaleDateString('ms-MY', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : '—';

  const paidDateFormatted = memberProfile?.paidAt
    ? new Date(memberProfile.paidAt).toLocaleDateString('ms-MY', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : '—';

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileSection}>
          <Avatar name={user?.name ?? 'U'} size={72} />
          <Text style={styles.name}>{user?.name ?? '—'}</Text>
          <Text style={styles.email}>{user?.email ?? '—'}</Text>
          {user?.phone && <Text style={styles.phone}>{user.phone}</Text>}
          <View style={[styles.memberBadge, isPaid && styles.memberBadgeActive]}>
            <Text style={[styles.memberBadgeText, isPaid && styles.memberBadgeTextActive]}>
              🏅 {isPaid ? 'Ahli Aktif (Berbayar)' : 'Ahli Persatuan'}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Akaun</Text>
          <View style={styles.card}>
            <SettingRow icon="👤" label="Edit Profil" onPress={() => setShowProfileModal(true)} />
            <View style={styles.rowDivider} />
            <SettingRow icon="🔒" label="Tukar Kata Laluan" onPress={() => setShowPasswordModal(true)} />
            <View style={styles.rowDivider} />
            <SettingRow icon="📱" label="Nombor Telefon" onPress={() => setShowProfileModal(true)} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Keahlian & Kewangan</Text>
          <View style={styles.card}>
            <SettingRow
              icon="💳"
              label="Maklumat Pembayaran"
              onPress={() => setShowBillingModal(true)}
              rightText={isPaid ? 'Aktif' : 'Tergantung'}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tetapan</Text>
          <View style={styles.card}>
            <SettingRow icon="🔔" label="Pemberitahuan" onPress={handleToggleNotifications} />
            <View style={styles.rowDivider} />
            <SettingRow icon="🌐" label="Bahasa" onPress={handleSelectLanguage} />
            <View style={styles.rowDivider} />
            <SettingRow icon="ℹ️" label="Tentang Aplikasi" onPress={handleAboutApp} />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.card}>
            <SettingRow icon="🚪" label="Log Keluar" onPress={handleLogout} danger />
          </View>
        </View>

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={showProfileModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowProfileModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Kemaskini Profil</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nama Penuh</Text>
              <TextInput
                style={styles.textInput}
                value={profileName}
                onChangeText={setProfileName}
                placeholder="Masukkan nama penuh"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nombor Telefon</Text>
              <TextInput
                style={styles.textInput}
                value={profilePhone}
                onChangeText={setProfilePhone}
                placeholder="Contoh: 0123456789"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnCancel]}
                onPress={() => setShowProfileModal(false)}
                disabled={isSavingProfile}
              >
                <Text style={styles.modalBtnTextCancel}>Batal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnSave]}
                onPress={handleSaveProfile}
                disabled={isSavingProfile}
              >
                {isSavingProfile ? (
                  <ActivityIndicator size="small" color={Colors.white} />
                ) : (
                  <Text style={styles.modalBtnTextSave}>Simpan</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        visible={showPasswordModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Tukar Kata Laluan</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Kata Laluan Semasa</Text>
              <TextInput
                style={styles.textInput}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry
                placeholder="Masukkan kata laluan semasa"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Kata Laluan Baru</Text>
              <TextInput
                style={styles.textInput}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                placeholder="Minima 8 aksara"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Sahkan Kata Laluan Baru</Text>
              <TextInput
                style={styles.textInput}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                placeholder="Masukkan semula kata laluan baru"
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnCancel]}
                onPress={() => setShowPasswordModal(false)}
                disabled={isSavingPassword}
              >
                <Text style={styles.modalBtnTextCancel}>Batal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnSave]}
                onPress={handleSavePassword}
                disabled={isSavingPassword}
              >
                {isSavingPassword ? (
                  <ActivityIndicator size="small" color={Colors.white} />
                ) : (
                  <Text style={styles.modalBtnTextSave}>Simpan</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Billing/Membership Info Modal */}
      <Modal
        visible={showBillingModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowBillingModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Maklumat Pembayaran & Keahlian</Text>

            <View style={styles.billingCard}>
              <View style={styles.billingRow}>
                <Text style={styles.billingLabel}>Peranan</Text>
                <Text style={styles.billingVal}>Ahli Persatuan (MEMBER)</Text>
              </View>
              <View style={styles.billingDivider} />
              <View style={styles.billingRow}>
                <Text style={styles.billingLabel}>Yuran Keahlian</Text>
                <Text style={styles.billingVal}>RM 50.00 / tahun</Text>
              </View>
              <View style={styles.billingDivider} />
              <View style={styles.billingRow}>
                <Text style={styles.billingLabel}>Status Pembayaran</Text>
                <Text style={[styles.billingVal, styles.statusLabelVal, isPaid ? styles.statusPaid : styles.statusPending]}>
                  {isPaid ? '● AKTIF (BAYAR)' : '● TERGANTUNG (BELUM BAYAR)'}
                </Text>
              </View>
              <View style={styles.billingDivider} />
              <View style={styles.billingRow}>
                <Text style={styles.billingLabel}>Tarikh Dibayar</Text>
                <Text style={styles.billingVal}>{paidDateFormatted}</Text>
              </View>
              <View style={styles.billingDivider} />
              <View style={styles.billingRow}>
                <Text style={styles.billingLabel}>Tarikh Tamat Tempoh</Text>
                <Text style={styles.billingVal}>{expiryDateFormatted}</Text>
              </View>
            </View>

            {isPaid ? (
              <View style={styles.billingTipContainer}>
                <Text style={styles.billingTipText}>
                  🎉 Terima kasih atas sokongan tahunan anda kepada Persatuan Haiwan Malaysia! Sumbangan anda membantu membiayai usaha menyelamat dan membela kebajikan haiwan.
                </Text>
              </View>
            ) : (
              <View style={styles.paymentPendingContainer}>
                <Text style={styles.paymentWarningText}>
                  ⚠️ Status akaun anda masih tergantung. Sila lakukan pembayaran yuran tahunan RM50.00 untuk mengaktifkan akses penuh ke portal ahli dan kelulusan projek.
                </Text>

                <TouchableOpacity
                  style={styles.payBtn}
                  onPress={handlePayMembership}
                  disabled={isPaying}
                >
                  {isPaying ? (
                    <ActivityIndicator size="small" color={Colors.white} />
                  ) : (
                    <Text style={styles.payBtnText}>Bayar Yuran Keahlian (RM 50.00)</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnCancel, { width: '100%' }]}
                onPress={() => setShowBillingModal(false)}
                disabled={isPaying}
              >
                <Text style={styles.modalBtnTextCancel}>Tutup</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  profileSection: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    ...Shadow.sm,
  },
  name: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginTop: Spacing.md,
  },
  email: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  phone: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    marginTop: 2,
  },
  memberBadge: {
    marginTop: Spacing.md,
    backgroundColor: Colors.warningLight,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.warning + '40',
  },
  memberBadgeActive: {
    backgroundColor: Colors.successLight,
    borderColor: Colors.success + '40',
  },
  memberBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.warning,
  },
  memberBadgeTextActive: {
    color: Colors.success,
  },
  section: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.textMuted,
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadow.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.md,
    paddingVertical: 16,
  },
  rowIcon: {
    fontSize: FontSize.md,
    marginRight: Spacing.md,
    width: 24,
  },
  rowLabel: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  rightText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginRight: 6,
  },
  chevron: {
    fontSize: FontSize.lg,
    color: Colors.textMuted,
  },
  rowDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginLeft: 52,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.md,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadow.lg,
  },
  modalTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  inputLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  modalBtn: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBtnCancel: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalBtnSave: {
    backgroundColor: Colors.primary,
  },
  modalBtnTextCancel: {
    color: Colors.textSecondary,
    fontWeight: FontWeight.semibold,
    textAlign: 'center',
  },
  modalBtnTextSave: {
    color: Colors.white,
    fontWeight: FontWeight.semibold,
  },

  // Billing Modal Specfic Styles
  billingCard: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  billingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  billingLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
  billingVal: {
    fontSize: FontSize.xs,
    color: Colors.textPrimary,
    fontWeight: FontWeight.bold,
  },
  statusLabelVal: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  statusPaid: {
    color: Colors.success,
  },
  statusPending: {
    color: Colors.danger,
  },
  billingDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
  },
  billingTipContainer: {
    backgroundColor: Colors.successLight + '40',
    borderWidth: 1,
    borderColor: Colors.success + '20',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  billingTipText: {
    fontSize: FontSize.xs,
    color: Colors.success,
    lineHeight: 22,
    fontWeight: FontWeight.medium,
  },
  paymentPendingContainer: {
    marginBottom: Spacing.md,
  },
  paymentWarningText: {
    fontSize: FontSize.xs,
    color: Colors.danger,
    lineHeight: 22,
    fontWeight: FontWeight.medium,
    backgroundColor: Colors.dangerLight + '40',
    borderWidth: 1,
    borderColor: Colors.danger + '20',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  payBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.sm,
  },
  payBtnText: {
    color: Colors.white,
    fontWeight: FontWeight.bold,
    fontSize: FontSize.sm,
  },
});
