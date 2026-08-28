import { useState, useEffect, useCallback } from 'react';
import { summaryService } from '@/services/summary.service';
import { MonthlySummaryResponse, AlertResponse } from '@/types/api';

interface UseMonthlySummaryResult {
  summary: MonthlySummaryResponse | null;
  loading: boolean;
  error: string | null;
  refetch: (month?: string) => Promise<void>;
}

export function useMonthlySummary(initialMonth?: string): UseMonthlySummaryResult {
  const [summary, setSummary] = useState<MonthlySummaryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async (month?: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await summaryService.getMonthlySummary(month);
      setSummary(data);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement du résumé');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary(initialMonth);
  }, [fetchSummary, initialMonth]);

  return {
    summary,
    loading,
    error,
    refetch: fetchSummary,
  };
}

interface UseAlertsResult {
  alert: AlertResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useAlerts(): UseAlertsResult {
  const [alert, setAlert] = useState<AlertResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await summaryService.getAlerts();
      setAlert(data);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des alertes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  return {
    alert,
    loading,
    error,
    refetch: fetchAlerts,
  };
}