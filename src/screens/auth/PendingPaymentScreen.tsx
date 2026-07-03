// src/screens/auth/PendingPaymentScreen.tsx — MEMBER with PENDING payment status
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { Colors } from '../../constants/colors';
import {
  BorderRadius,
  FontSize,
  FontWeight,
  Shadow,
  Spacing,
} from '../../constants/theme';
import { authService } from '../../services/authService';
import { useStripe } from '@stripe/stripe-react-native';

export function PendingPaymentScreen() {
  const { user, refreshUser, logout } = useAuth();
  const [isPaying, setIsPaying] = useState(false);
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const handlePay = async () => {
    setIsPaying(true);
    try {
      // 1. Create Payment Intent
      const { clientSecret } = await authService.createPaymentIntent();

      // 2. Initialize Payment Sheet
      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: 'Haiwan Kita',
        paymentIntentClientSecret: clientSecret,
        defaultBillingDetails: {
          name: user?.name,
          email: user?.email,
          phone: user?.phone || undefined,
        },
      });

      if (initError) {
        Alert.alert('Ralat', initError.message);
        return;
      }

      // 3. Present Payment Sheet
      const { error: presentError } = await presentPaymentSheet();

      if (presentError) {
        if (presentError.code === 'Canceled') {
          // User closed the sheet
          return;
        }
        Alert.alert('Ralat Pembayaran', presentError.message);
      } else {
        // Payment succeeded!
        Alert.alert('Pembayaran Berjaya! 🎉', 'Terima kasih. Keahlian anda telah diaktifkan.');
        // Refresh the user session so the app routes to Member Dashboard
        await refreshUser();
      }

    } catch (err: any) {
      if (err?.status === 409) {
        Alert.alert('Sudah Dibayar', 'Yuran keahlian anda telah pun dibayar.');
        await refreshUser();
      } else {
        Alert.alert('Pembayaran Gagal', err?.message ?? 'Sila cuba lagi.');
      }
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Icon */}
        <View style={styles.iconCircle}>
          <Text style={{ fontSize: 48 }}>🐾</Text>
        </View>

        <Text style={styles.welcome}>Selamat Datang, {user?.name?.split(' ')[0]}!</Text>
        <Text style={styles.title}>Lengkapkan Keahlian Anda</Text>
        <Text style={styles.body}>
          Sebagai Ahli Persatuan, anda dikehendaki membayar yuran tahunan sebanyak{' '}
          <Text style={styles.highlight}>RM50.00</Text> untuk mengaktifkan akaun anda dan
          menikmati semua faedah keahlian penuh.
        </Text>

        {/* Benefits */}
        <View style={styles.benefitsCard}>
          <Text style={styles.benefitsTitle}>Faedah Keahlian</Text>
          {[
            '✅ Sahkan kehadiran sukarelawan',
            '✅ Muat turun sijil penyertaan PDF',
            '✅ Urus projek misi baru',
            '✅ Akses ke laporan aktiviti',
          ].map((b) => (
            <Text key={b} style={styles.benefit}>{b}</Text>
          ))}
        </View>

        {/* Fee card */}
        <View style={styles.feeCard}>
          <Text style={styles.feeLabel}>Yuran Tahunan</Text>
          <Text style={styles.feeAmount}>RM 50.00</Text>
          <Text style={styles.feeNote}>Sah sehingga 1 tahun dari tarikh pembayaran</Text>
        </View>

        {/* Pay button */}
        <TouchableOpacity
          style={[styles.payBtn, isPaying && styles.btnDisabled]}
          onPress={handlePay}
          disabled={isPaying}
          activeOpacity={0.85}
        >
          {isPaying ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.payBtnText}>💳  Bayar RM50 Sekarang</Text>
          )}
        </TouchableOpacity>

        {/* Logout */}
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Log Keluar</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: {
    flex: 1,
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  welcome: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
    marginBottom: 4,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  body: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: Spacing.lg,
  },
  highlight: {
    fontWeight: FontWeight.bold,
    color: Colors.primary,
  },
  benefitsCard: {
    width: '100%',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadow.sm,
  },
  benefitsTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  benefit: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: 6,
    lineHeight: 24,
  },
  feeCard: {
    width: '100%',
    backgroundColor: Colors.primaryLight,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    marginBottom: Spacing.lg,
    borderWidth: 1.5,
    borderColor: Colors.primary + '40',
  },
  feeLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  feeAmount: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.extrabold,
    color: Colors.primary,
    lineHeight: 44,
  },
  feeNote: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 4,
  },
  payBtn: {
    width: '100%',
    height: 54,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: Spacing.md,
  },
  btnDisabled: { opacity: 0.7 },
  payBtnText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.white,
  },
  logoutBtn: { paddingVertical: Spacing.sm },
  logoutText: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    textDecorationLine: 'underline',
  },
});
