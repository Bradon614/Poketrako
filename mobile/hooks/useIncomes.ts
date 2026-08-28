import { useState, useEffect, useCallback } from 'react';
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
    fetchIncomes(initialParams);
  }, [fetchIncomes, initialParams]);

  const getIncome = async (id: number) => {
    return incomeService.getIncome(id);
  };

  const create = async (data: CreateIncomeRequest) => {
    setError(null);
    try {
      const result = await incomeService.createIncome(data);
      await fetchIncomes(initialParams);
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
      await fetchIncomes(initialParams);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la mise à jour');
      throw err;
    }
  };

  const deleteIncome = async (id: number) => {
    setError(null);
    try {
      await incomeService.deleteIncome(id);
      await fetchIncomes(initialParams);
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