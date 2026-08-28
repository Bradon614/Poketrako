import { api } from './api';
import {
  Expense,
  ExpenseQueryParams,
  CreateExpenseRequest,
  UpdateExpenseRequest,
  ReceiptUpload,
} from '@/types/api';

export const expenseService = {
  async getExpenses(params?: ExpenseQueryParams): Promise<Expense[]> {
    return api.get<Expense[]>('/expenses', params as Record<string, string | number | undefined>);
  },

  async getExpense(id: number): Promise<Expense> {
    return api.get<Expense>(`/expenses/${id}`);
  },

  async createExpense(data: CreateExpenseRequest): Promise<Expense | { message: string; count: number; expenses: Expense[] }> {
    return api.post('/expenses', data);
  },

  async updateExpense(id: number, data: UpdateExpenseRequest): Promise<{ message: string }> {
    return api.put<{ message: string }>(`/expenses/${id}`, data);
  },

  async deleteExpense(id: number): Promise<void> {
    return api.delete<void>(`/expenses/${id}`);
  },

  async uploadReceipt(expenseId: number, file: { uri: string; name: string; type: string }): Promise<ReceiptUpload> {
    const formData = new FormData();
    formData.append('receipt', file as any);
    return api.upload<ReceiptUpload>(`/expenses/${expenseId}/receipt`, formData);
  },

  async deleteReceipt(expenseId: number): Promise<void> {
    return api.delete<void>(`/expenses/${expenseId}/receipt`);
  },
};