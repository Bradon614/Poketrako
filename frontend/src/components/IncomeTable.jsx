import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LuPlus } from 'react-icons/lu';
import { getIncomes } from '../api';
import { useCurrency } from '../context/CurrencyContext';
import { formatMoney } from '../currency';
import '../styles/IncomeTable.css';

const IncomeTable = () => {
  const [incomes, setIncomes] = useState(null);
  const [error, setError] = useState('');
  const { currency } = useCurrency();

  useEffect(() => {
    const fetchIncomes = async () => {
      try {
        setIncomes(await getIncomes({ _sort: 'date:DESC', _limit: 5 }));
      } catch (err) {
        setError(err.message || 'Erreur de récupération des revenus');
      }
    };
    fetchIncomes();
  }, []);

  return (
    <div className="income-table-container card">
      <div className="table-header">
        <h3>Revenus récents</h3>
        <Link to="/incomes/new" className="link-with-icon"><LuPlus /> Nouveau revenu</Link>
      </div>

      {error && <p className="state-message state-error">{error}</p>}
      {!error && !incomes && <p className="state-message">Chargement…</p>}
      {!error && incomes && incomes.length === 0 && (
        <p className="state-message">Aucun revenu pour l'instant.</p>
      )}

      {incomes && incomes.length > 0 && (
        <table className="income-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Source</th>
              <th>Montant</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {incomes.map(income => (
              <tr key={income.id}>
                <td>{new Date(income.date).toLocaleDateString()}</td>
                <td>{income.source}</td>
                <td>{formatMoney(income.amount, currency)}</td>
                <td>{income.description || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default IncomeTable;
