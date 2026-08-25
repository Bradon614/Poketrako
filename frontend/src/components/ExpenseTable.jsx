import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LuPlus } from 'react-icons/lu';
import { getExpenses } from '../api';
import '../styles/ExpenseTable.css';

const ExpenseTable = () => {
  const [expenses, setExpenses] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        setExpenses(await getExpenses({ _sort: 'date:DESC', _limit: 5 }));
      } catch (err) {
        setError(err.message || 'Erreur de récupération des dépenses');
      }
    };
    fetchExpenses();
  }, []);

  return (
    <div className="expense-table-container card">
      <div className="table-header">
        <h3>Activité récente</h3>
        <Link to="/expenses/new" className="link-with-icon"><LuPlus /> Nouvelle dépense</Link>
      </div>

      {error && <p className="state-message state-error">{error}</p>}
      {!error && !expenses && <p className="state-message">Chargement…</p>}
      {!error && expenses && expenses.length === 0 && (
        <p className="state-message">Aucune dépense pour l'instant.</p>
      )}

      {expenses && expenses.length > 0 && (
        <table className="expense-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Montant (€)</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map(exp => (
              <tr key={exp.id}>
                <td>{exp.date ? new Date(exp.date).toLocaleDateString() : '—'}</td>
                <td>{exp.description || '—'}</td>
                <td>{Number(exp.amount).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ExpenseTable;
