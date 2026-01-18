import { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  Pressable, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { SystemWindow } from '@/components/SystemWindow';
import { useAuthStore } from '@/stores/auth';

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    try {
      await login(email, password);
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Login Failed', error instanceof Error ? error.message : 'An error occurred');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#0A0A0F' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={{ flex: 1, justifyContent: 'center', padding: 24 }}>
        {/* Logo / Title */}
        <View style={{ alignItems: 'center', marginBottom: 48 }}>
          <Text style={{ 
            color: '#60A5FA', 
            fontSize: 32, 
            fontWeight: '700', 
            letterSpacing: 2 
          }}>
            SOLO LEVELING
          </Text>
          <Text style={{ color: '#64748B', fontSize: 14, marginTop: 8, letterSpacing: 1 }}>
            ARISE, HUNTER
          </Text>
        </View>

        {/* Login Form */}
        <SystemWindow variant="default" style={{ marginBottom: 24 }}>
          <View style={{ marginBottom: 16 }}>
            <Text style={{ color: '#64748B', fontSize: 11, letterSpacing: 1, marginBottom: 6 }}>
              EMAIL
            </Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="hunter@example.com"
              placeholderTextColor="#475569"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              style={{
                backgroundColor: '#0F0F14',
                borderWidth: 1,
                borderColor: '#1E293B',
                borderRadius: 8,
                padding: 14,
                color: '#E2E8F0',
                fontSize: 16,
              }}
            />
          </View>

          <View style={{ marginBottom: 24 }}>
            <Text style={{ color: '#64748B', fontSize: 11, letterSpacing: 1, marginBottom: 6 }}>
              PASSWORD
            </Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Enter password"
              placeholderTextColor="#475569"
              secureTextEntry
              style={{
                backgroundColor: '#0F0F14',
                borderWidth: 1,
                borderColor: '#1E293B',
                borderRadius: 8,
                padding: 14,
                color: '#E2E8F0',
                fontSize: 16,
              }}
            />
          </View>

          <Pressable
            onPress={handleLogin}
            disabled={isLoading}
            style={({ pressed }) => ({
              backgroundColor: pressed ? '#3B82F6' : '#60A5FA',
              paddingVertical: 14,
              borderRadius: 8,
              alignItems: 'center',
              opacity: isLoading ? 0.7 : 1,
            })}
          >
            {isLoading ? (
              <ActivityIndicator color="#0A0A0F" />
            ) : (
              <Text style={{ color: '#0A0A0F', fontSize: 16, fontWeight: '700' }}>
                LOGIN
              </Text>
            )}
          </Pressable>
        </SystemWindow>

        {/* Sign Up Link */}
        <View style={{ alignItems: 'center' }}>
          <Text style={{ color: '#64748B', fontSize: 14 }}>
            Don't have an account?{' '}
            <Link href="/signup" style={{ color: '#60A5FA', fontWeight: '600' }}>
              Sign Up
            </Link>
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
