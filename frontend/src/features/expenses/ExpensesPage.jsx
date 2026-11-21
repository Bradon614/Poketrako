import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { LuFilter, LuPencil, LuPlus, LuReceipt, LuRepeat, LuSearch, LuTrash2, LuZap } from 'react-icons/lu';
import {
  Button,
  Card,
  EmptyState,
  ErrorState,
  GlassPanel,
  IconButton,
  SearchInput,
  SectionCard,
  SegmentedControl,
  Select,
  SkeletonRows,
  useConfirm,
} from '../../components/ui';
import { deleteExpense, getExpenses } from '../../api';
import { useAsync, useDebounced } from '../../lib/hooks';
import { useToast } from '../../lib/toast';
import { PERIOD_PRESETS, formatDate, resolvePeriod } from '../../lib/dates';
import { getCategoryVisual } from '../../lib/categoryVisual';
import { formatMoney } from '../../currency';
import { useSession } from '../../lib/session';
import { useCategories } from '../categories/useCategories';
import { TransactionRow } from '../transactions/TransactionRow';
import ExpenseFormModal from './ExpenseFormModal';
import '../../features/transactions/transactions.css';
import './Expenses.css';

/**
 * ExpensesPage — the real expense list.
 *
 * The previous /expenses route reused the dashboard widget, which capped the
 * list at five rows and offered no search, filters, edit or delete. This page
 * restores the full workflow:
 *   period · category · type · sort (server-side) + free-text search (client)
 *   create · edit · delete · receipt view/replace/remove
 *
 * Rows are list items, never a table, so nothing overflows on a phone.
 */

const PAGE_SIZE = 20;
const SORT_OPTIONS = [
  { value: 'date:DESC', label: 'Plus récentes' },
  { value: 'date:ASC', label: 'Plus anciennes' },
  { value: 'amount:DESC', label: 'Montant décroissant' },
  { value: 'amount:ASC', label: 'Montant croissant' },
];

const ExpensesPage = () => {
  const { currency } = useSession();
  const { categories } = useCategories();
  const { success, error: toastError } = useToast();
  const confirm = useConfirm();
  const [searchParams, setSearchParams] = useSearchParams();

  const [period, setPeriod] = useState('all');
  const [categoryId, setCategoryId] = useState('');
  const [type, setType] = useState('');
  const [sort, setSort] = useState('date:DESC');
  const [query, setQuery] = useState('');
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [modal, setModal] = useState({ open: false, expense: null });

  const debouncedQuery = useDebounced(query, 220);
  const range = useMemo(() => resolvePeriod(period), [period]);

  const params = useMemo(
    () => ({
      _sort: sort,
      ...(range.start ? { start: range.start } : {}),
      ...(range.end ? { end: range.end } : {}),
      ...(categoryId ? { categoryId } : {}),
      ...(type ? { type } : {}),
    }),
    [sort, range.start, range.end, categoryId, type]
  );

  const state = useAsync(() => getExpenses(params), [JSON.stringify(params)]);

  // Deep link support: /expenses?new=1 opens the create modal (the sidebar CTA
  // and the dashboard shortcut both rely on it).
  useEffect(() => {
    if (searchParams.get('new') === '1') {
      setModal({ open: true, expense: null });
      const next = new URLSearchParams(searchParams);
      next.delete('new');
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    setVisible(PAGE_SIZE);
  }, [debouncedQuery, period, categoryId, type, sort]);

  const expenses = useMemo(() => (Array.isArray(state.data) ? state.data : []), [state.data]);

  /** Free-text search runs on the loaded period (the API has no text search). */
  const filtered = useMemo(() => {
    const needle = debouncedQuery.trim().toLowerCase();
    if (!needle) return expenses;
    return expenses.filter((expense) => {
      const haystack = [
        expense.description,
        expense.category?.name,
        expense.amount,
        expense.date,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(needle);
    });
  }, [expenses, debouncedQuery]);

  const total = filtered.reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0);
  const recurringCount = filtered.filter((expense) => expense.type === 'RECURRING').length;
  const shown = filtered.slice(0, visible);
  const hasFilters = Boolean(debouncedQuery || categoryId || type || period !== 'all');

  const resetFilters = () => {
    setQuery('');
    setCategoryId('');
    setType('');
    setPeriod('all');
  };

  const handleDelete = async (expense) => {
    const title = expense.category?.name || expense.description || 'cette dépense';
    const confirmed = await confirm({
      title: 'Supprimer la dépense',
      message: `« ${title} » sera définitivement supprimée de votre historique.`,
      confirmLabel: 'Supprimer',
      destructive: true,
    });
    if (!confirmed) return;

    try {
      await deleteExpense(expense.id);
      success('Dépense supprimée.');
      await state.refetch({ quiet: true });
    } catch (error) {
      toastError(error?.message || 'Impossible de supprimer la dépense');
    }
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h2 className="page-title">Vos dépenses</h2>
          <p className="page-subtitle">
            {filtered.length > 0
              ? `${filtered.length} opération${filtered.length > 1 ? 's' : ''} · ${formatMoney(total, currency)}`
              : 'Toutes vos sorties d’argent, filtrables par période et par catégorie'}
          </p>
        </div>
        <Button variant="primary" icon={LuPlus} onClick={() => setModal({ open: true, expense: null })}>
          Nouvelle dépense
        </Button>
      </div>

      <GlassPanel className="tx-toolbar" role="search">
        <SearchInput
          className="tx-toolbar__search"
          value={query}
          onChange={setQuery}
          placeholder="Rechercher une dépense, un montant, une date…"
          label="Rechercher une dépense"
        />

        <div className="tx-toolbar__filters">
          <SegmentedControl
            options={PERIOD_PRESETS}
            value={period}
            onChange={setPeriod}
            size="sm"
            label="Période"
            className="segmented--keep-labels"
          />

          <Select
            className="tx-toolbar__select"
            aria-label="Filtrer par catégorie"
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
          >
            <option value="">Toutes catégories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>

          <Select
            className="tx-toolbar__select"
            aria-label="Filtrer par type"
            value={type}
            onChange={(event) => setType(event.target.value)}
          >
            <option value="">Tous les types</option>
            <option value="ONE_TIME">Ponctuelles</option>
            <option value="RECURRING">Récurrentes</option>
          </Select>

          <Select
            className="tx-toolbar__select"
            aria-label="Trier"
            value={sort}
            onChange={(event) => setSort(event.target.value)}
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>

          {hasFilters && (
            <Button variant="quiet" size="sm" icon={LuFilter} onClick={resetFilters}>
              Réinitialiser
            </Button>
          )}
        </div>
      </GlassPanel>

      {state.error ? (
        <ErrorState message={state.error} onRetry={state.refetch} />
      ) : state.loading && expenses.length === 0 ? (
        <Card padded="none">
          <SkeletonRows rows={6} />
        </Card>
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={expenses.length === 0 ? LuReceipt : LuSearch}
            title={expenses.length === 0 ? 'Aucune dépense pour l’instant' : 'Aucun résultat'}
            message={
              expenses.length === 0
                ? 'Ajoutez votre première dépense pour voir où part votre argent, puis suivez votre budget.'
                : 'Aucune dépense ne correspond à ces filtres. Essayez une autre période ou réinitialisez la recherche.'
            }
            action={
              expenses.length === 0 ? (
                <Button variant="primary" icon={LuPlus} onClick={() => setModal({ open: true, expense: null })}>
                  Ajouter une dépense
                </Button>
              ) : (
                <Button variant="secondary" icon={LuFilter} onClick={resetFilters}>
                  Réinitialiser les filtres
                </Button>
              )
            }
          />
        </Card>
      ) : (
        <SectionCard
          title="Historique"
          subtitle={
            recurringCount > 0
              ? `${recurringCount} dépense${recurringCount > 1 ? 's' : ''} récurrente${recurringCount > 1 ? 's' : ''} · total ${formatMoney(total, currency)}`
              : `Total affiché ${formatMoney(total, currency)}`
          }
          padded={false}
        >
          <ul className="tx-list">
            {shown.map((expense) => {
              const title = expense.category?.name || expense.description || 'Sans catégorie';
              const visual = getCategoryVisual(expense.category?.name || expense.description);
              return (
                <TransactionRow
                  key={expense.id}
                  kind="expense"
                  title={title}
                  meta={formatDate(expense.date || expense.creationDate)}
                  description={expense.category ? expense.description : undefined}
                  badge={expense.type === 'RECURRING' ? { recurring: true } : undefined}
                  amountLabel={`−${formatMoney(expense.amount, currency)}`}
                  icon={visual.icon}
                  color={visual.color}
                  receipt={expense.receiptUpload}
                  onOpen={() => setModal({ open: true, expense })}
                  actions={
                    <>
                      <IconButton
                        icon={LuPencil}
                        label={`Modifier ${title}`}
                        size="sm"
                        onClick={() => setModal({ open: true, expense })}
                      />
                      <IconButton
                        icon={LuTrash2}
                        label={`Supprimer ${title}`}
                        size="sm"
                        variant="danger"
                        onClick={() => handleDelete(expense)}
                      />
                    </>
                  }
                />
              );
            })}
          </ul>

          {filtered.length > shown.length && (
            <div className="tx-more">
              <Button variant="secondary" onClick={() => setVisible((current) => current + PAGE_SIZE)}>
                Afficher {Math.min(PAGE_SIZE, filtered.length - shown.length)} de plus
              </Button>
              <span className="hint">
                {shown.length} / {filtered.length} affichées
              </span>
            </div>
          )}
        </SectionCard>
      )}

      <ExpenseFormModal
        open={modal.open}
        expense={modal.expense}
        categories={categories}
        currency={currency}
        onClose={() => setModal({ open: false, expense: null })}
        onSaved={() => state.refetch({ quiet: true })}
      />
    </>
  );
};

export default ExpensesPage;
