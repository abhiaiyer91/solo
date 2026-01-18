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
  ScrollView,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { SystemWindow } from '@/components/SystemWindow';
import { useAuthStore } from '@/stores/auth';

export default function SignupScreen() {
  const router = useRouter();
  const { signup, isLoading } = useAuthStore();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSignup = async () => {
    if (!name || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }

    try {
      await signup(name, email, password);
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Signup Failed', error instanceof Error ? error.message : 'An error occurred');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#0A0A0F' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo / Title */}
        <View style={{ alignItems: 'center', marginBottom: 32 }}>
          <Text style={{ 
            color: '#60A5FA', 
            fontSize: 28, 
            fontWeight: '700', 
            letterSpacing: 2 
          }}>
            BECOME A HUNTER
          </Text>
          <Text style={{ color: '#64748B', fontSize: 13, marginTop: 8, textAlign: 'center' }}>
            Begin your journey to become the strongest
          </Text>
        </View>

        {/* Signup Form */}
        <SystemWindow variant="default" style={{ marginBottom: 24 }}>
          <View style={{ marginBottom: 16 }}>
            <Text style={{ color: '#64748B', fontSize: 11, letterSpacing: 1, marginBottom: 6 }}>
              NAME
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Your hunter name"
              placeholderTextColor="#475569"
              autoCapitalize="words"
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

          <View style={{ marginBottom: 16 }}>
            <Text style={{ color: '#64748B', fontSize: 11, letterSpacing: 1, marginBottom: 6 }}>
              PASSWORD
            </Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Min. 8 characters"
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

          <View style={{ marginBottom: 24 }}>
            <Text style={{ color: '#64748B', fontSize: 11, letterSpacing: 1, marginBottom: 6 }}>
              CONFIRM PASSWORD
            </Text>
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Repeat password"
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
            onPress={handleSignup}
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
                CREATE ACCOUNT
              </Text>
            )}
          </Pressable>
        </SystemWindow>

        {/* Login Link */}
        <View style={{ alignItems: 'center' }}>
          <Text style={{ color: '#64748B', fontSize: 14 }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: '#60A5FA', fontWeight: '600' }}>
              Login
            </Link>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
