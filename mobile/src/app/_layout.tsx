import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const queryClient = new QueryClient();

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="game"
            options={{ gestureEnabled: false, animation: 'fade_from_bottom' }}
          />
          <Stack.Screen
            name="results"
            options={{ animation: 'fade_from_bottom' }}
          />
        </Stack>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
