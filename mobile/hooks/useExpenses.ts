import { useState, useEffect, useCallback, useRef } from 'react';
import { expenseService } from '@/services/expense.service';
import { Expense, ExpenseQueryParams, CreateExpenseRequest, UpdateExpenseRequest } from '@/types/api';

interface UseExpensesResult {
  expenses: Expense[];
  loading: boolean;
  error: string | null;
  refetch: (params?: ExpenseQueryParams) => Promise<void>;
  getExpense: (id: number) => Promise<Expense>;
  create: (data: CreateExpenseRequest) => Promise<Expense | { message: string; count: number; expenses: Expense[] }>;
  updateExpense: (id: number, data: UpdateExpenseRequest) => Promise<void>;
  deleteExpense: (id: number) => Promise<void>;
}

export function useExpenses(initialParams?: ExpenseQueryParams): UseExpensesResult {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Keep the latest params in a ref: parents pass inline object literals whose
  // identity changes every render, which would retrigger the mount effect and
  // loop fetches forever.
  const paramsRef = useRef(initialParams);

  useEffect(() => {
    paramsRef.current = initialParams;
  }, [initialParams]);

  const fetchExpenses = useCallback(async (params?: ExpenseQueryParams) => {
    setLoading(true);
    setError(null);
    try {
      const data = await expenseService.getExpenses(params);
      setExpenses(data);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des dépenses');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExpenses(paramsRef.current);
  }, [fetchExpenses]);

  // Stable identity so screens that key focus effects on this function don't
  // re-run their fetch loop on every render.
  const getExpense = useCallback(async (id: number) => {
    return expenseService.getExpense(id);
  }, []);

  const create = async (data: CreateExpenseRequest) => {
    setError(null);
    try {
      const result = await expenseService.createExpense(data);
      await fetchExpenses(paramsRef.current);
      return result;
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création');
      throw err;
    }
  };

  const updateExpense = async (id: number, data: UpdateExpenseRequest) => {
    setError(null);
    try {
      await expenseService.updateExpense(id, data);
      await fetchExpenses(paramsRef.current);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la mise à jour');
      throw err;
    }
  };

  const deleteExpense = async (id: number) => {
    setError(null);
    try {
      await expenseService.deleteExpense(id);
      await fetchExpenses(paramsRef.current);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la suppression');
      throw err;
    }
  };

  return {
    expenses,
    loading,
    error,
    refetch: fetchExpenses,
    getExpense,
    create,
    updateExpense,
    deleteExpense,
  };
}