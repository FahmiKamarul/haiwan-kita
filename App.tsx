// App.tsx — Root entry point
import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/context/AuthContext';
import { TrackingProvider } from './src/context/TrackingContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { Colors } from './src/constants/colors';

import { StripeProvider } from '@stripe/stripe-react-native';

export default function App() {
  return (
    <SafeAreaProvider>
      <StripeProvider publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_mock'}>
        <NavigationContainer>
          <AuthProvider>
            <TrackingProvider>
              <StatusBar style="dark" backgroundColor={Colors.background} />
              <RootNavigator />
            </TrackingProvider>
          </AuthProvider>
        </NavigationContainer>
      </StripeProvider>
    </SafeAreaProvider>
  );
}
