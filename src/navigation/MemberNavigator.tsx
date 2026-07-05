// src/navigation/MemberNavigator.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { MemberStackParamList, MemberTabParamList } from '../types';
import { Colors } from '../constants/colors';
import { FontSize, FontWeight } from '../constants/theme';

// Screens
import { MemberDashboard } from '../screens/member/MemberDashboard';
import { MemberProjectsScreen } from '../screens/member/ProjectsScreen';
import { MemberSettingsScreen } from '../screens/member/SettingsScreen';
import { MarkAttendanceScreen } from '../screens/member/MarkAttendanceScreen';
import { ProposeMissionScreen } from '../screens/member/ProposeMissionScreen';
import { MissionDetailScreen } from '../screens/volunteer/MissionDetailScreen';
import { ActivityHistoryScreen } from '../screens/shared/ActivityHistoryScreen';
import { SubmitReviewScreen } from '../screens/volunteer/SubmitReviewScreen';

const Tab = createBottomTabNavigator<MemberTabParamList>();
const Stack = createStackNavigator<MemberStackParamList>();

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return (
    <Text style={{ fontSize: focused ? 22 : 20, opacity: focused ? 1 : 0.5 }}>
      {emoji}
    </Text>
  );
}

function MemberTabs() {
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
        component={MemberDashboard}
        options={{
          tabBarLabel: 'Papan Pemuka',
          tabBarIcon: ({ focused }) => <TabIcon emoji="📊" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Projects"
        component={MemberProjectsScreen}
        options={{
          tabBarLabel: 'Projek',
          tabBarIcon: ({ focused }) => <TabIcon emoji="📋" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Billing"
        component={ActivityHistoryScreen}
        options={{
          tabBarLabel: 'Bil',
          tabBarIcon: ({ focused }) => <TabIcon emoji="💳" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={MemberSettingsScreen}
        options={{
          tabBarLabel: 'Tetapan',
          tabBarIcon: ({ focused }) => <TabIcon emoji="⚙️" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

export function MemberNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MemberTabs" component={MemberTabs} />
      <Stack.Screen
        name="MarkAttendance"
        component={MarkAttendanceScreen}
        options={{ presentation: 'card' }}
      />
      <Stack.Screen
        name="MissionDetail"
        component={MissionDetailScreen}
        options={{ presentation: 'card' }}
      />
      <Stack.Screen
        name="SubmitReview"
        component={SubmitReviewScreen}
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen
        name="ProposeMission"
        component={ProposeMissionScreen}
        options={{ presentation: 'card' }}
      />
    </Stack.Navigator>
  );
}
