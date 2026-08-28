import * as SecureStore from 'expo-secure-store';
import { ApiError } from '@/types/api';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

if (!API_URL) {
  console.warn('[API] EXPO_PUBLIC_API_URL is not set. API calls will fail.');
}

const TOKEN_KEY = 'poketrako_jwt';

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor() {
    this.baseUrl = `${API_URL}/api`.replace(/\/+$/, '');
  }

  async initialize() {
    this.token = await SecureStore.getItemAsync(TOKEN_KEY);
  }

  async getToken(): Promise<string | null> {
    if (!this.token) {
      this.token = await SecureStore.getItemAsync(TOKEN_KEY);
    }
    return this.token;
  }

  async setToken(token: string | null) {
    this.token = token;
    if (token) {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    } else {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
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

      if (response.status === 401) {
        await this.setToken(null);
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
      throw this.createApiError(
        { status: 500 } as Response,
        'Erreur de connexion au serveur'
      );
    }
  }

  private createApiError(response: Response, message: string): ApiError {
    return {
      message,
      code: `HTTP_${response.status}`,
      details: { status: response.status },
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

      if (response.status === 401) {
        await this.setToken(null);
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
      throw this.createApiError(
        { status: 500 } as Response,
        'Erreur de connexion au serveur'
      );
    }
  }
}

export const api = new ApiClient();