import React from 'react';
import { Tabs } from 'expo-router';
import { Grid2x2, Zap } from 'lucide-react-native';
import { useClientOnlyValue } from '@/lib/useClientOnlyValue';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: useClientOnlyValue(false, true),
        tabBarStyle: {
          backgroundColor: '#0A0A0A',
          borderTopColor: '#1A1A1A',
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: '#F5E642',
        tabBarInactiveTintColor: '#444444',
        headerStyle: { backgroundColor: '#0A0A0A' },
        headerTintColor: '#F5F5F0',
        headerShadowVisible: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Cross Duel',
          tabBarLabel: 'Puzzle',
          tabBarIcon: ({ color }: { color: string }) => (
            <Grid2x2 size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          title: 'Duels',
          tabBarLabel: 'Duels',
          tabBarIcon: ({ color }: { color: string }) => (
            <Zap size={22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
