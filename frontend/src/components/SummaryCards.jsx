import { useEffect, useState } from 'react';
import { LuTrendingUp, LuTrendingDown, LuScale } from 'react-icons/lu';
import { getMonthlySummary } from '../api';
import { useCurrency } from '../context/CurrencyContext';
import { formatMoney } from '../currency';
import '../styles/SummaryCards.css';

const SummaryCards = () => {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');
  const { currency } = useCurrency();

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setSummary(await getMonthlySummary());
      } catch (err) {
        setError(err.message || 'Erreur de récupération du résumé mensuel');
      }
    };
    fetchSummary();
  }, []);

  if (error) return <p className="state-message state-error">{error}</p>;
  if (!summary) return <p className="state-message">Chargement du résumé…</p>;

  return (
    <div className="summary-cards">
      <div className="card">
        <div className="card-label"><LuTrendingUp /> Revenus</div>
        <div className="card-value">{formatMoney(summary.income, currency)}</div>
      </div>
      <div className="card">
        <div className="card-label"><LuTrendingDown /> Dépenses</div>
        <div className="card-value">{formatMoney(summary.expenses, currency)}</div>
      </div>
      <div className="card">
        <div className="card-label"><LuScale /> Solde</div>
        <div className={`card-value ${summary.balance >= 0 ? 'positive' : 'negative'}`}>
          {formatMoney(summary.balance, currency)}
        </div>
      </div>
    </div>
  );
};

export default SummaryCards;
