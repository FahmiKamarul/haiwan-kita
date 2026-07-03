// src/navigation/VolunteerNavigator.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { VolunteerStackParamList, VolunteerTabParamList } from '../types';
import { Colors } from '../constants/colors';
import { FontSize, FontWeight } from '../constants/theme';

// Screens
import { VolunteerHomeScreen } from '../screens/volunteer/HomeScreen';
import { MissionsSearchScreen } from '../screens/volunteer/MissionsSearchScreen';
import { ActivityHistoryScreen } from '../screens/shared/ActivityHistoryScreen';
import { VolunteerProfileScreen } from '../screens/volunteer/ProfileScreen';
import { MissionDetailScreen } from '../screens/volunteer/MissionDetailScreen';

const Tab = createBottomTabNavigator<VolunteerTabParamList>();
const Stack = createStackNavigator<VolunteerStackParamList>();

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return (
    <Text style={{ fontSize: focused ? 22 : 20, opacity: focused ? 1 : 0.5 }}>
      {emoji}
    </Text>
  );
}

function VolunteerTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: {
          height: 80,
          paddingBottom: 20,
          paddingTop: 6,
          borderTopColor: Colors.border,
        },
        tabBarLabelStyle: {
          fontSize: FontSize.xs,
          fontWeight: FontWeight.medium,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={VolunteerHomeScreen}
        options={{
          tabBarLabel: 'Utama',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Search"
        component={MissionsSearchScreen}
        options={{
          tabBarLabel: 'Cari',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🔍" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="ActivityHistory"
        component={ActivityHistoryScreen}
        options={{
          tabBarLabel: 'Sejarah',
          tabBarIcon: ({ focused }) => <TabIcon emoji="📜" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={VolunteerProfileScreen}
        options={{
          tabBarLabel: 'Profil',
          tabBarIcon: ({ focused }) => <TabIcon emoji="👤" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

export function VolunteerNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="VolunteerTabs" component={VolunteerTabs} />
      <Stack.Screen
        name="MissionDetail"
        component={MissionDetailScreen}
        options={{ presentation: 'card' }}
      />
    </Stack.Navigator>
  );
}
