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

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <AuthProvider>
          <TrackingProvider>
            <StatusBar style="dark" backgroundColor={Colors.background} />
            <RootNavigator />
          </TrackingProvider>
        </AuthProvider>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
