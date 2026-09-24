/**
 * API service — Axios instance with JWT interceptor.
 * Handles all HTTP communication with the FastAPI backend.
 */

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

export const getApiBaseUrl = (): string => {
  // 1. Explicit environment variable override from mobile/.env
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // 2. Dynamic host detection from Expo Metro bundler (Works for Expo Go on physical phones)
  const hostUri =
    Constants.expoConfig?.hostUri ||
    (Constants as any).manifest2?.extra?.expoGo?.debuggerHost ||
    (Constants as any).manifest?.debuggerHost;

  if (hostUri) {
    const host = hostUri.split(':')[0];
    if (host && host !== 'localhost' && host !== '127.0.0.1') {
      return `http://${host}:8000/api/v1`;
    }
  }

  // 3. Web running in browser
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location?.hostname) {
    return `http://${window.location.hostname}:8000/api/v1`;
  }

  // 4. Default fallback: use current local network IP for physical devices or 10.0.2.2 for emulator
  if (Platform.OS === 'android') {
    // If running in standalone or without hostUri, default to local machine IP
    return 'http://10.115.22.186:8000/api/v1';
  }

  // 5. iOS Simulator or default
  return 'http://localhost:8000/api/v1';
};

interface RequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: string;
}

class ApiService {
  private explicitBaseUrl?: string;

  constructor(baseUrl?: string) {
    this.explicitBaseUrl = baseUrl;
  }

  public getBaseUrl(): string {
    return this.explicitBaseUrl || getApiBaseUrl();
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    const token = await AsyncStorage.getItem('access_token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  private async request<T>(endpoint: string, options: RequestOptions): Promise<T> {
    const baseUrl = this.getBaseUrl();
    const url = `${baseUrl}${endpoint}`;
    const headers = {
      ...(await this.getAuthHeaders()),
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        method: options.method,
        headers,
        body: options.body,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: `HTTP error ${response.status}` }));
        throw new Error(error.detail || `HTTP ${response.status}`);
      }

      return response.json();
    } catch (err: any) {
      console.warn(`[API] Request failed: ${options.method} ${url}`, err?.message || err);
      throw err;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const api = new ApiService();
export default api;
