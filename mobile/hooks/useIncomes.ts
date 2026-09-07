import { useState, useEffect, useCallback, useRef } from 'react';
import { incomeService } from '@/services/income.service';
import { Income, IncomeQueryParams, CreateIncomeRequest, UpdateIncomeRequest } from '@/types/api';

interface UseIncomesResult {
  incomes: Income[];
  loading: boolean;
  error: string | null;
  refetch: (params?: IncomeQueryParams) => Promise<void>;
  getIncome: (id: number) => Promise<Income>;
  create: (data: CreateIncomeRequest) => Promise<Income>;
  updateIncome: (id: number, data: UpdateIncomeRequest) => Promise<void>;
  deleteIncome: (id: number) => Promise<void>;
}

export function useIncomes(initialParams?: IncomeQueryParams): UseIncomesResult {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Keep the latest params in a ref: parents pass inline object literals whose
  // identity changes every render, which would retrigger the mount effect and
  // loop fetches forever.
  const paramsRef = useRef(initialParams);

  useEffect(() => {
    paramsRef.current = initialParams;
  }, [initialParams]);

  const fetchIncomes = useCallback(async (params?: IncomeQueryParams) => {
    setLoading(true);
    setError(null);
    try {
      const data = await incomeService.getIncomes(params);
      setIncomes(data);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des revenus');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIncomes(paramsRef.current);
  }, [fetchIncomes]);

  // Stable identity so screens that key focus effects on this function don't
  // re-run their fetch loop on every render.
  const getIncome = useCallback(async (id: number) => {
    return incomeService.getIncome(id);
  }, []);

  const create = async (data: CreateIncomeRequest) => {
    setError(null);
    try {
      const result = await incomeService.createIncome(data);
      await fetchIncomes(paramsRef.current);
      return result;
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création');
      throw err;
    }
  };

  const updateIncome = async (id: number, data: UpdateIncomeRequest) => {
    setError(null);
    try {
      await incomeService.updateIncome(id, data);
      await fetchIncomes(paramsRef.current);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la mise à jour');
      throw err;
    }
  };

  const deleteIncome = async (id: number) => {
    setError(null);
    try {
      await incomeService.deleteIncome(id);
      await fetchIncomes(paramsRef.current);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la suppression');
      throw err;
    }
  };

  return {
    incomes,
    loading,
    error,
    refetch: fetchIncomes,
    getIncome,
    create,
    updateIncome,
    deleteIncome,
  };
}