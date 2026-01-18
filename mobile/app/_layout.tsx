import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth';
import * as SplashScreen from 'expo-splash-screen';

// Keep splash screen visible while we check auth
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      retry: 1,
    },
  },
});

export default function RootLayout() {
  const { initialize, isInitialized } = useAuthStore();

  useEffect(() => {
    async function init() {
      await initialize();
      await SplashScreen.hideAsync();
    }
    init();
  }, [initialize]);

  if (!isInitialized) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#0A0A0F',
          },
          headerTintColor: '#E2E8F0',
          headerTitleStyle: {
            fontWeight: '600',
          },
          contentStyle: {
            backgroundColor: '#0A0A0F',
          },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="login"
          options={{
            title: 'Login',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="signup"
          options={{
            title: 'Create Account',
            presentation: 'modal',
          }}
        />
      </Stack>
    </QueryClientProvider>
  );
}
