import { useMemo } from 'react';
import { getBudgetAlert, getExpenses, getIncomes, getMonthlySummary } from '../../api';
import { useAsync } from '../../lib/hooks';
import { addMonths, startOfMonth, toISODate } from '../../lib/dates';
import { getCategoryVisual } from '../../lib/categoryVisual';

/**
 * useDashboardData — one place that loads everything the dashboard shows.
 *
 * Three requests, in parallel, then every figure is derived in memory:
 *   /summary/monthly   → income, expenses, balance, budget for the month
 *   /expenses?start=…  → 6 months of expenses (chart, breakdown, recent list)
 *   /incomes?start=…   → 6 months of incomes (chart, recent list, deltas)
 *
 * The previous dashboard fired /summary/monthly three times (SummaryCards,
 * BudgetSettings and BudgetAlert each fetched it) and re-fetched both lists
 * per widget. This keeps it to one round of calls and shares the result.
 */

const MONTHS = 6;

export function useDashboardData(months = MONTHS) {
  const start = useMemo(
    () => toISODate(startOfMonth(addMonths(new Date(), -(months - 1)))),
    [months]
  );

  const summaryState = useAsync(() => getMonthlySummary(), []);
  const expensesState = useAsync(() => getExpenses({ start, _sort: 'date:DESC' }), [start]);
  const incomesState = useAsync(() => getIncomes({ start, _sort: 'date:DESC' }), [start]);
  const alertState = useAsync(() => getBudgetAlert(), []);

  const loading = summaryState.loading || expensesState.loading || incomesState.loading;
  const error = summaryState.error || expensesState.error || incomesState.error;

  const refetch = async () => {
    await Promise.all([
      summaryState.refetch(),
      expensesState.refetch(),
      incomesState.refetch(),
      alertState.refetch(),
    ]);
  };

  const derived = useMemo(() => {
    const expenses = Array.isArray(expensesState.data) ? expensesState.data : [];
    const incomes = Array.isArray(incomesState.data) ? incomesState.data : [];
    const now = new Date();
    const monthKey = (date) => {
      const parsed = new Date(date);
      return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}`;
    };
    const currentKey = monthKey(now);
    const previousKey = monthKey(addMonths(now, -1));

    /* --- Monthly series for the chart (oldest → newest) --- */
    const buckets = new Map();
    for (let index = months - 1; index >= 0; index -= 1) {
      const ref = addMonths(now, -index);
      const key = monthKey(ref);
      buckets.set(key, {
        key,
        label: ref.toLocaleDateString('fr-FR', { month: 'short' }).replace('.', ''),
        year: ref.getFullYear(),
        income: 0,
        expense: 0,
      });
    }

    let currentMonthExpenses = 0;
    let currentMonthIncomes = 0;
    let previousMonthExpenses = 0;
    let previousMonthIncomes = 0;

    expenses.forEach((expense) => {
      const raw = expense.date || expense.creationDate;
      if (!raw) return;
      const amount = Number(expense.amount) || 0;
      const key = monthKey(raw);
      if (buckets.has(key)) buckets.get(key).expense += amount;
      if (key === currentKey) currentMonthExpenses += amount;
      if (key === previousKey) previousMonthExpenses += amount;
    });

    incomes.forEach((income) => {
      if (!income.date) return;
      const amount = Number(income.amount) || 0;
      const key = monthKey(income.date);
      if (buckets.has(key)) buckets.get(key).income += amount;
      if (key === currentKey) currentMonthIncomes += amount;
      if (key === previousKey) previousMonthIncomes += amount;
    });

    const series = Array.from(buckets.values());

    /* --- Category breakdown for the current month --- */
    const byCategory = new Map();
    expenses
      .filter((expense) => monthKey(expense.date || expense.creationDate) === currentKey)
      .forEach((expense) => {
        const name = expense.category?.name || expense.description || 'Sans catégorie';
        const entry = byCategory.get(name) || { name, total: 0, count: 0 };
        entry.total += Number(expense.amount) || 0;
        entry.count += 1;
        byCategory.set(name, entry);
      });

    const breakdown = Array.from(byCategory.values())
      .sort((a, b) => b.total - a.total)
      .map((entry) => ({ ...entry, ...getCategoryVisual(entry.name) }));

    const breakdownTotal = breakdown.reduce((sum, entry) => sum + entry.total, 0);

    /* --- Recent activity: both kinds, newest first --- */
    const recent = [
      ...expenses.map((expense) => ({ kind: 'expense', data: expense })),
      ...incomes.map((income) => ({ kind: 'income', data: income })),
    ]
      .sort((a, b) => {
        const left = new Date(a.data.date || a.data.creationDate).getTime();
        const right = new Date(b.data.date || b.data.creationDate).getTime();
        return right - left;
      })
      .slice(0, 6);

    /* --- Month-over-month deltas (percent) --- */
    const percentDelta = (current, previous) => {
      if (!previous) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    /* --- Recurring share, shown as a KPI --- */
    const recurringTotal = expenses
      .filter((expense) => expense.type === 'RECURRING' && monthKey(expense.date || expense.creationDate) === currentKey)
      .reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0);

    return {
      series,
      breakdown,
      breakdownTotal,
      recent,
      monthExpenses: currentMonthExpenses,
      monthIncomes: currentMonthIncomes,
      expenseDelta: percentDelta(currentMonthExpenses, previousMonthExpenses),
      incomeDelta: percentDelta(currentMonthIncomes, previousMonthIncomes),
      recurringTotal,
      expenseCount: expenses.filter((expense) => monthKey(expense.date || expense.creationDate) === currentKey).length,
    };
  }, [expensesState.data, incomesState.data, months]);

  return { summary: summaryState.data, alert: alertState.data, loading, error, refetch, ...derived };
}
