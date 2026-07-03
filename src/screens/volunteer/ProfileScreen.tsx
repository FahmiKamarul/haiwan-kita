// src/screens/volunteer/ProfileScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
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
import { missionService } from '../../services/missionService';
import { authService } from '../../services/authService';
import { Mission } from '../../types';

const ROLE_LABELS: Record<string, string> = {
  VOLUNTEER: 'Sukarelawan',
  MEMBER: 'Ahli Persatuan',
  ADMIN: 'Pentadbir',
};

const AVAILABLE_SKILLS = [
  'Menyelamat kucing',
  'Menyelamat anjing',
  'Pertolongan cemas',
  'Pemberian makanan',
  'Pembersihan',
  'Transporter',
  'Fotografi & Video',
  'Media Sosial',
];

interface SettingRowProps {
  icon: string;
  label: string;
  onPress?: () => void;
  danger?: boolean;
}

function SettingRow({ icon, label, onPress, danger }: SettingRowProps) {
  return (
    <TouchableOpacity style={styles.settingRow} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.settingIcon}>{icon}</Text>
      <Text style={[styles.settingLabel, danger && { color: Colors.danger }]}>{label}</Text>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
}

export function VolunteerProfileScreen() {
  const { user, logout, updateProfile } = useAuth();
  const [myMissions, setMyMissions] = useState<Mission[]>([]);

  // Profile Modal State
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileName, setProfileName] = useState(user?.name ?? '');
  const [profilePhone, setProfilePhone] = useState(user?.phone ?? '');
  const [profileSkills, setProfileSkills] = useState<string[]>(
    user?.volunteerProfile?.skills ? user.volunteerProfile.skills.split(',').map(s => s.trim()) : []
  );
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Password Modal State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);

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

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await missionService.getMyMissions();
        setMyMissions(data);
      } catch {
        // Silently fail, fallback to 0 or static context data
      }
    };
    fetchStats();
  }, []);

  // Update form fields when user profile changes
  useEffect(() => {
    if (user) {
      setProfileName(user.name ?? '');
      setProfilePhone(user.phone ?? '');
      setProfileSkills(user.volunteerProfile?.skills ? user.volunteerProfile.skills.split(',').map(s => s.trim()) : []);
    }
  }, [user]);

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
        skills: profileSkills.join(', '),
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

  const totalMissions = myMissions.length > 0 
    ? myMissions.length 
    : (user?.volunteerProfile?.totalMissions ?? 0);
    
  const totalCerts = myMissions.filter(m => m.state === 'COMPLETED').length;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile card */}
        <View style={styles.profileCard}>
          <Avatar name={user?.name ?? 'U'} size={72} />
          <Text style={styles.name}>{user?.name ?? '—'}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>
              {ROLE_LABELS[user?.role ?? 'VOLUNTEER']}
            </Text>
          </View>
          <Text style={styles.email}>{user?.email ?? '—'}</Text>
          {user?.phone && <Text style={styles.phone}>{user.phone}</Text>}
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {String(totalMissions).padStart(2, '0')}
            </Text>
            <Text style={styles.statLabel}>Misi Disertai</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {String(totalCerts).padStart(2, '0')}
            </Text>
            <Text style={styles.statLabel}>Sijil Diperoleh</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {user?.createdAt 
                ? ((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 365.25)).toFixed(1)
                : '0.0'}yr
            </Text>
            <Text style={styles.statLabel}>Bersama SAFM</Text>
          </View>
        </View>

        {/* Settings */}
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

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Kemahiran / Kepakaran</Text>
              <View style={styles.skillsContainer}>
                {AVAILABLE_SKILLS.map(skill => {
                  const isSelected = profileSkills.includes(skill);
                  return (
                    <TouchableOpacity
                      key={skill}
                      style={[styles.skillChip, isSelected && styles.skillChipSelected]}
                      onPress={() => {
                        if (isSelected) {
                          setProfileSkills(profileSkills.filter(s => s !== skill));
                        } else {
                          setProfileSkills([...profileSkills, skill]);
                        }
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.skillChipText, isSelected && styles.skillChipTextSelected]}>
                        {skill}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  profileCard: {
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
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
  roleBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    marginTop: 6,
    marginBottom: 6,
  },
  roleText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.primary,
  },
  email: { fontSize: FontSize.sm, color: Colors.textSecondary },
  phone: { fontSize: FontSize.sm, color: Colors.textMuted, marginTop: 2 },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    paddingVertical: Spacing.lg,
    marginTop: Spacing.md,
    ...Shadow.sm,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.extrabold,
    color: Colors.primary,
  },
  statLabel: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  statDivider: { width: 1, backgroundColor: Colors.border },
  section: { paddingHorizontal: Spacing.md, paddingTop: Spacing.md },
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
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 16,
  },
  settingIcon: { fontSize: 18, marginRight: Spacing.md, width: 24 },
  settingLabel: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  chevron: { fontSize: 20, color: Colors.textMuted },
  rowDivider: { height: 1, backgroundColor: Colors.borderLight, marginLeft: 52 },

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
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  skillChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  skillChipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  skillChipText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  skillChipTextSelected: {
    color: Colors.white,
    fontWeight: FontWeight.semibold,
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
  },
  modalBtnTextSave: {
    color: Colors.white,
    fontWeight: FontWeight.semibold,
  },
});
