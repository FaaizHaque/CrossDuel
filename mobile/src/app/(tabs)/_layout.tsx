import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: '#0A0A0A',
          borderTopColor: '#1A1A1A',
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 4,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          letterSpacing: 2,
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
          tabBarLabel: 'DUELS',
          tabBarIcon: ({ color }: { color: string }) => (
            <Ionicons name="flash" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'Practice',
          tabBarLabel: 'PRACTICE',
          tabBarIcon: ({ color }: { color: string }) => (
            <Ionicons name="grid" size={22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
