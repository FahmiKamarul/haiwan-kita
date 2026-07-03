// src/navigation/RootNavigator.tsx
import React, { useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { setNavigateToLogin } from '../lib/api';
import { AuthNavigator } from './AuthNavigator';
import { VolunteerNavigator } from './VolunteerNavigator';
import { MemberNavigator } from './MemberNavigator';
import { AdminNavigator } from './AdminNavigator';
import { PendingPaymentScreen } from '../screens/auth/PendingPaymentScreen';
import { Colors } from '../constants/colors';

const Stack = createStackNavigator();

export function RootNavigator() {
  const { isLoading, isAuthenticated, user, logout } = useAuth();

  // Wire the axios interceptor's 401 handler to logout
  useEffect(() => {
    setNavigateToLogin(logout);
  }, [logout]);

  if (isLoading) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!isAuthenticated || !user) {
    return <AuthNavigator />;
  }

  // MEMBER with pending payment
  if (
    user.role === 'MEMBER' &&
    (user.paymentStatus === 'PENDING' ||
      user.memberProfile?.paymentStatus === 'PENDING')
  ) {
    return <PendingPaymentScreen />;
  }

  if (user.role === 'ADMIN') {
    return <AdminNavigator />;
  }

  if (user.role === 'MEMBER') {
    return <MemberNavigator />;
  }

  // Default: VOLUNTEER
  return <VolunteerNavigator />;
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
});
