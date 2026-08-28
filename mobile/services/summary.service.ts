import { api } from './api';
import { MonthlySummaryResponse, SummaryResponse, AlertResponse } from '@/types/api';

export const summaryService = {
  async getMonthlySummary(month?: string): Promise<MonthlySummaryResponse> {
    const params = month ? { month } : undefined;
    return api.get<MonthlySummaryResponse>('/summary/monthly', params as Record<string, string | number | undefined>);
  },

  async getSummary(start: string, end: string): Promise<SummaryResponse> {
    return api.get<SummaryResponse>('/summary', { start, end });
  },

  async getAlerts(): Promise<AlertResponse> {
    return api.get<AlertResponse>('/summary/alerts');
  },
};