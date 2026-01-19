/**
 * Auth utilities for mobile
 * Uses expo-secure-store for token persistence
 */

import * as SecureStore from 'expo-secure-store';
import { api } from './api';

const TOKEN_KEY = 'authToken';
const USER_KEY = 'authUser';

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

/**
 * Store auth token securely
 */
export async function setAuthToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

/**
 * Get stored auth token
 */
export async function getAuthToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    return null;
  }
}

/**
 * Remove auth token (logout)
 */
export async function removeAuthToken(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  await SecureStore.deleteItemAsync(USER_KEY);
}

/**
 * Store user data
 */
export async function setUser(user: User): Promise<void> {
  await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
}

/**
 * Get stored user data
 */
export async function getUser(): Promise<User | null> {
  try {
    const userJson = await SecureStore.getItemAsync(USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  } catch {
    return null;
  }
}

/**
 * Better Auth response types
 */
interface BetterAuthSession {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

/**
 * Login with email and password
 * Uses Better Auth sign-in endpoint
 */
export async function login(email: string, password: string): Promise<AuthResponse> {
  const response = await api.post<BetterAuthSession>('/api/auth/sign-in/email', {
    email,
    password,
  });

  await setAuthToken(response.token);
  await setUser(response.user);

  return {
    token: response.token,
    user: response.user,
  };
}

/**
 * Sign up with name, email, and password
 * Uses Better Auth sign-up endpoint
 */
export async function signup(name: string, email: string, password: string): Promise<AuthResponse> {
  const response = await api.post<BetterAuthSession>('/api/auth/sign-up/email', {
    name,
    email,
    password,
  });

  await setAuthToken(response.token);
  await setUser(response.user);

  return {
    token: response.token,
    user: response.user,
  };
}

/**
 * Logout - clear stored credentials
 * Uses Better Auth sign-out endpoint
 */
export async function logout(): Promise<void> {
  try {
    // Call server logout endpoint to invalidate session
    await api.post('/api/auth/sign-out');
  } catch {
    // Ignore errors - we'll clear local storage anyway
  }

  await removeAuthToken();
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const token = await getAuthToken();
  return !!token;
}

/**
 * Verify token is still valid with server
 * Uses Better Auth get-session endpoint
 */
export async function verifySession(): Promise<User | null> {
  try {
    const token = await getAuthToken();
    if (!token) return null;

    const response = await api.get<{ session: { userId: string }; user: User }>('/api/auth/get-session');
    if (response.user) {
      await setUser(response.user);
      return response.user;
    }
    return null;
  } catch {
    // Token is invalid, clear it
    await removeAuthToken();
    return null;
  }
}
