import { api } from './api';
import {
  LoginRequest,
  SignupRequest,
  AuthResponse,
  MeResponse,
  UpdateBudgetRequest,
  UpdateCurrencyRequest,
} from '@/types/api';

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    return api.post<AuthResponse>('/auth/login', credentials);
  },

  async signup(data: SignupRequest): Promise<AuthResponse> {
    return api.post<AuthResponse>('/auth/signup', data);
  },

  async getMe(): Promise<MeResponse> {
    return api.get<MeResponse>('/auth/me');
  },

  async updateBudget(budget: number): Promise<{ budget: number }> {
    return api.put<{ budget: number }>('/auth/budget', { budget } as UpdateBudgetRequest);
  },

  async updateCurrency(currency: string): Promise<{ currency: string }> {
    return api.put<{ currency: string }>('/auth/currency', { currency } as UpdateCurrencyRequest);
  },
};