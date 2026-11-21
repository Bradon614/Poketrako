import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { ApiError } from '@/types/api';

const ENV_API_URL = process.env.EXPO_PUBLIC_API_URL;

// On a physical device over Expo Go (LAN), a bare localhost/127.0.0.1 value
// points at the phone itself, not the dev machine. Rewrite it to the host
// machine's LAN address taken from the Expo manifest (debug/dev only) — no IP
// is ever hardcoded. Production URLs (https) pass through untouched.
function resolveApiUrl(): string | undefined {
  if (!ENV_API_URL || !/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(ENV_API_URL)) {
    return ENV_API_URL;
  }
  if (Platform.OS !== 'web' && __DEV__) {
    const hostUri =
      Constants.expoConfig?.hostUri ??
      (Constants.expoGoConfig as { debuggerHost?: string } | undefined)?.debuggerHost ??
      null;
    const lanHost = hostUri?.split(':')[0];
    if (lanHost) {
      const port = ENV_API_URL.match(/:(\d+)$/)?.[1] ?? '5001';
      return `http://${lanHost}:${port}`;
    }
  }
  return ENV_API_URL;
}

const API_URL = resolveApiUrl();

const TOKEN_KEY = 'poketrako_jwt';

// expo-secure-store has no web implementation (its methods throw), so on web
// we persist the token in localStorage instead.
const webStorage = {
  async getItem(key: string): Promise<string | null> {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(key);
  },
  async setItem(key: string, value: string): Promise<void> {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(key, value);
  },
  async deleteItemAsync(key: string): Promise<void> {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(key);
  },
};

const tokenStorage =
  Platform.OS === 'web'
    ? webStorage
    : {
        getItem: (key: string) => SecureStore.getItemAsync(key),
        setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
        deleteItemAsync: (key: string) => SecureStore.deleteItemAsync(key),
      };

// AuthContext registers a handler here so a 401 on an authenticated request
// resets the auth state (which drives the AuthGate redirect to login).
let unauthorizedHandler: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler;
}

function notifyUnauthorized() {
  unauthorizedHandler?.();
}

function validateApiUrl(): string {
  if (!API_URL) {
    const message =
      'EXPO_PUBLIC_API_URL is not set. Configure it in mobile/.env (see .env.example).';
    if (__DEV__) {
      console.error('[API]', message);
    }
    throw new Error(message);
  }
  return API_URL;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor() {
    // The env var holds the base URL without the /api suffix, but tolerate a
    // trailing slash or an /api suffix to avoid building /api/api.
    const base = validateApiUrl().replace(/\/+$/, '').replace(/\/api$/, '');
    this.baseUrl = `${base}/api`;
  }

  async initialize() {
    this.token = await tokenStorage.getItem(TOKEN_KEY);
  }

  async getToken(): Promise<string | null> {
    if (!this.token) {
      this.token = await tokenStorage.getItem(TOKEN_KEY);
    }
    return this.token;
  }

  async setToken(token: string | null) {
    this.token = token;
    if (token) {
      await tokenStorage.setItem(TOKEN_KEY, token);
    } else {
      await tokenStorage.deleteItemAsync(TOKEN_KEY);
    }
  }

  private async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = await this.getToken();
    const url = `${this.baseUrl}${path}`;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);

      // Only treat a 401 as session expiry when the request actually carried a
      // token — a bare 401 from login/signup is a credentials error and must
      // surface the backend's own message.
      if (response.status === 401 && token) {
        await this.setToken(null);
        notifyUnauthorized();
        throw this.createApiError(response, 'Session expirée. Veuillez vous reconnecter.');
      }

      const text = await response.text();
      const data = text ? JSON.parse(text) : null;

      if (!response.ok) {
        throw this.createApiError(response, data?.message || `Erreur ${response.status}`);
      }

      return data as T;
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('Network')) {
        throw this.createNetworkError();
      }
      if (error && typeof error === 'object' && 'code' in error) {
        throw error;
      }
      throw this.createServerError();
    }
  }

  private createApiError(response: Response, message: string): ApiError {
    return {
      message,
      code: `HTTP_${response.status}`,
      details: { status: response.status },
    };
  }

  private createServerError(): ApiError {
    return {
      message: 'Erreur de connexion au serveur',
      code: 'HTTP_500',
      details: { status: 500 },
    };
  }

  private createNetworkError(): ApiError {
    return {
      message: 'Impossible de se connecter au serveur. Vérifiez votre connexion internet.',
      code: 'NETWORK_ERROR',
    };
  }

  async get<T>(path: string, params?: Record<string, string | number | undefined>): Promise<T> {
    const query = params
      ? `?${new URLSearchParams(
          Object.entries(params)
            .filter(([, v]) => v !== undefined && v !== '')
            .map(([k, v]) => [k, String(v)])
        )}`
      : '';
    return this.request<T>(`${path}${query}`);
  }

  async post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(path: string): Promise<T> {
    return this.request<T>(path, { method: 'DELETE' });
  }

  async upload<T>(path: string, formData: FormData): Promise<T> {
    const token = await this.getToken();
    const url = `${this.baseUrl}${path}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      if (response.status === 401 && token) {
        await this.setToken(null);
        notifyUnauthorized();
        throw this.createApiError(response, 'Session expirée. Veuillez vous reconnecter.');
      }

      const text = await response.text();
      const data = text ? JSON.parse(text) : null;

      if (!response.ok) {
        throw this.createApiError(response, data?.message || `Erreur ${response.status}`);
      }

      return data as T;
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('Network')) {
        throw this.createNetworkError();
      }
      if (error && typeof error === 'object' && 'code' in error) {
        throw error;
      }
      throw this.createServerError();
    }
  }
}

export const api = new ApiClient();