import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { LuBanknote, LuFilter, LuPencil, LuPlus, LuSearch, LuTrash2 } from 'react-icons/lu';
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
import { deleteIncome, getIncomes } from '../../api';
import { useAsync, useDebounced } from '../../lib/hooks';
import { useToast } from '../../lib/toast';
import { PERIOD_PRESETS, formatDate, resolvePeriod } from '../../lib/dates';
import { formatMoney } from '../../currency';
import { useSession } from '../../lib/session';
import { TransactionRow } from '../transactions/TransactionRow';
import IncomeFormModal from './IncomeFormModal';
import '../transactions/transactions.css';
import '../expenses/Expenses.css';

/**
 * IncomesPage — the real income list (same shape as the expenses page).
 *
 * The API only accepts start/end/_sort/_limit on /incomes, so the filters
 * offered here are period, sort and free-text search — no category or type
 * filter, because incomes have neither.
 */

const PAGE_SIZE = 20;
const SORT_OPTIONS = [
  { value: 'date:DESC', label: 'Plus récents' },
  { value: 'date:ASC', label: 'Plus anciens' },
  { value: 'amount:DESC', label: 'Montant décroissant' },
  { value: 'amount:ASC', label: 'Montant croissant' },
];

const IncomesPage = () => {
  const { currency } = useSession();
  const { success, error: toastError } = useToast();
  const confirm = useConfirm();
  const [searchParams, setSearchParams] = useSearchParams();

  const [period, setPeriod] = useState('all');
  const [sort, setSort] = useState('date:DESC');
  const [query, setQuery] = useState('');
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [modal, setModal] = useState({ open: false, income: null });

  const debouncedQuery = useDebounced(query, 220);
  const range = useMemo(() => resolvePeriod(period), [period]);

  const params = useMemo(
    () => ({
      _sort: sort,
      ...(range.start ? { start: range.start } : {}),
      ...(range.end ? { end: range.end } : {}),
    }),
    [sort, range.start, range.end]
  );

  const state = useAsync(() => getIncomes(params), [JSON.stringify(params)]);

  useEffect(() => {
    if (searchParams.get('new') === '1') {
      setModal({ open: true, income: null });
      const next = new URLSearchParams(searchParams);
      next.delete('new');
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    setVisible(PAGE_SIZE);
  }, [debouncedQuery, period, sort]);

  const incomes = useMemo(() => (Array.isArray(state.data) ? state.data : []), [state.data]);

  const filtered = useMemo(() => {
    const needle = debouncedQuery.trim().toLowerCase();
    if (!needle) return incomes;
    return incomes.filter((income) =>
      [income.source, income.description, income.amount, income.date]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(needle)
    );
  }, [incomes, debouncedQuery]);

  const total = filtered.reduce((sum, income) => sum + (Number(income.amount) || 0), 0);
  const shown = filtered.slice(0, visible);
  const hasFilters = Boolean(debouncedQuery || period !== 'all');

  const resetFilters = () => {
    setQuery('');
    setPeriod('all');
  };

  const handleDelete = async (income) => {
    const confirmed = await confirm({
      title: 'Supprimer le revenu',
      message: `« ${income.source} » sera définitivement supprimé de votre historique.`,
      confirmLabel: 'Supprimer',
      destructive: true,
    });
    if (!confirmed) return;

    try {
      await deleteIncome(income.id);
      success('Revenu supprimé.');
      await state.refetch({ quiet: true });
    } catch (error) {
      toastError(error?.message || 'Impossible de supprimer le revenu');
    }
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h2 className="page-title">Vos revenus</h2>
          <p className="page-subtitle">
            {filtered.length > 0
              ? `${filtered.length} entrée${filtered.length > 1 ? 's' : ''} · ${formatMoney(total, currency)}`
              : 'Salaires, ventes, missions — tout ce que vous encaissez'}
          </p>
        </div>
        <Button variant="primary" icon={LuPlus} onClick={() => setModal({ open: true, income: null })}>
          Nouveau revenu
        </Button>
      </div>

      <GlassPanel className="tx-toolbar" role="search">
        <SearchInput
          className="tx-toolbar__search"
          value={query}
          onChange={setQuery}
          placeholder="Rechercher une source, un montant…"
          label="Rechercher un revenu"
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
      ) : state.loading && incomes.length === 0 ? (
        <Card padded="none">
          <SkeletonRows rows={5} />
        </Card>
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={incomes.length === 0 ? LuBanknote : LuSearch}
            title={incomes.length === 0 ? 'Aucun revenu pour l’instant' : 'Aucun résultat'}
            message={
              incomes.length === 0
                ? 'Enregistrez votre premier revenu pour comparer vos entrées et vos sorties sur le tableau de bord.'
                : 'Aucun revenu ne correspond à ces filtres.'
            }
            action={
              incomes.length === 0 ? (
                <Button variant="primary" icon={LuPlus} onClick={() => setModal({ open: true, income: null })}>
                  Ajouter un revenu
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
          subtitle={`Total affiché ${formatMoney(total, currency)}`}
          padded={false}
        >
          <ul className="tx-list">
            {shown.map((income) => (
              <TransactionRow
                key={income.id}
                kind="income"
                title={income.source}
                meta={formatDate(income.date)}
                description={income.description}
                amountLabel={`+${formatMoney(income.amount, currency)}`}
                color="var(--c-income)"
                onOpen={() => setModal({ open: true, income })}
                actions={
                  <>
                    <IconButton
                      icon={LuPencil}
                      label={`Modifier ${income.source}`}
                      size="sm"
                      onClick={() => setModal({ open: true, income })}
                    />
                    <IconButton
                      icon={LuTrash2}
                      label={`Supprimer ${income.source}`}
                      size="sm"
                      variant="danger"
                      onClick={() => handleDelete(income)}
                    />
                  </>
                }
              />
            ))}
          </ul>

          {filtered.length > shown.length && (
            <div className="tx-more">
              <Button variant="secondary" onClick={() => setVisible((current) => current + PAGE_SIZE)}>
                Afficher {Math.min(PAGE_SIZE, filtered.length - shown.length)} de plus
              </Button>
              <span className="hint">
                {shown.length} / {filtered.length} affichés
              </span>
            </div>
          )}
        </SectionCard>
      )}

      <IncomeFormModal
        open={modal.open}
        income={modal.income}
        currency={currency}
        onClose={() => setModal({ open: false, income: null })}
        onSaved={() => state.refetch({ quiet: true })}
      />
    </>
  );
};

export default IncomesPage;
