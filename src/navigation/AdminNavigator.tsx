// src/navigation/AdminNavigator.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { AdminStackParamList, AdminTabParamList } from '../types';
import { Colors } from '../constants/colors';
import { FontSize, FontWeight } from '../constants/theme';

// Screens
import { AdminDashboard } from '../screens/admin/AdminDashboard';
import { AdminReportsScreen } from '../screens/admin/AdminReportsScreen';
import { AdminMapScreen } from '../screens/admin/AdminMapScreen';
import { AdminProjectsScreen } from '../screens/admin/AdminProjectsScreen';
import { ReviewProjectScreen } from '../screens/admin/ReviewProjectScreen';
import { MissionDetailScreen } from '../screens/volunteer/MissionDetailScreen';

const Tab = createBottomTabNavigator<AdminTabParamList>();
const Stack = createStackNavigator<AdminStackParamList>();

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return (
    <Text style={{ fontSize: focused ? 22 : 20, opacity: focused ? 1 : 0.5 }}>
      {emoji}
    </Text>
  );
}

function AdminTabs() {
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
        name="Dashboard"
        component={AdminDashboard}
        options={{
          tabBarLabel: 'Papan Pemuka',
          tabBarIcon: ({ focused }) => <TabIcon emoji="📊" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Map"
        component={AdminMapScreen}
        options={{
          tabBarLabel: 'Peta',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🗺️" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Projects"
        component={AdminProjectsScreen}
        options={{
          tabBarLabel: 'Projek',
          tabBarIcon: ({ focused }) => <TabIcon emoji="📋" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Reports"
        component={AdminReportsScreen}
        options={{
          tabBarLabel: 'Laporan',
          tabBarIcon: ({ focused }) => <TabIcon emoji="📈" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

export function AdminNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminTabs" component={AdminTabs} />
      <Stack.Screen
        name="ReviewProject"
        component={ReviewProjectScreen}
        options={{ presentation: 'card' }}
      />
      <Stack.Screen
        name="MissionDetail"
        component={MissionDetailScreen}
        options={{ presentation: 'card' }}
      />
    </Stack.Navigator>
  );
}
