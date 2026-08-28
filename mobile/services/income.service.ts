import { api } from './api';
import { Income, IncomeQueryParams, CreateIncomeRequest, UpdateIncomeRequest } from '@/types/api';

export const incomeService = {
  async getIncomes(params?: IncomeQueryParams): Promise<Income[]> {
    return api.get<Income[]>('/incomes', params as Record<string, string | number | undefined>);
  },

  async getIncome(id: number): Promise<Income> {
    return api.get<Income>(`/incomes/${id}`);
  },

  async createIncome(data: CreateIncomeRequest): Promise<Income> {
    return api.post<Income>('/incomes', data);
  },

  async updateIncome(id: number, data: UpdateIncomeRequest): Promise<{ message: string }> {
    return api.put<{ message: string }>(`/incomes/${id}`, data);
  },

  async deleteIncome(id: number): Promise<void> {
    return api.delete<void>(`/incomes/${id}`);
  },
};