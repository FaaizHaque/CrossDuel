import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
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
        tabBarInactiveTintColor: '#555555',
        headerStyle: { backgroundColor: '#0A0A0A' },
        headerTintColor: '#F5F5F0',
        headerShadowVisible: false,
      }}>
      <Tabs.Screen
        name="two"
        options={{
          title: 'Duels',
          tabBarLabel: 'Duels',
          tabBarIcon: ({ color }: { color: string }) => (
            <Ionicons name="flash" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'Practice',
          tabBarLabel: 'Practice',
          tabBarIcon: ({ color }: { color: string }) => (
            <Ionicons name="grid" size={22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
