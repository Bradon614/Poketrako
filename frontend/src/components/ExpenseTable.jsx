import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LuPlus, LuPaperclip, LuTrash2 } from 'react-icons/lu';
import { getExpenses, deleteReceipt, receiptUrl } from '../api';
import '../styles/ExpenseTable.css';

const ExpenseTable = () => {
  const [expenses, setExpenses] = useState(null);
  const [error, setError] = useState('');

  const fetchExpenses = async () => {
    try {
      setExpenses(await getExpenses({ _sort: 'date:DESC', _limit: 5 }));
    } catch (err) {
      setError(err.message || 'Erreur de récupération des dépenses');
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleDeleteReceipt = async (expenseId) => {
    try {
      await deleteReceipt(expenseId);
      fetchExpenses();
    } catch (err) {
      setError(err.message || 'Erreur lors de la suppression du justificatif');
    }
  };

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
              <th>Justificatif</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map(exp => (
              <tr key={exp.id}>
                <td>{exp.date ? new Date(exp.date).toLocaleDateString() : '—'}</td>
                <td>{exp.description || '—'}</td>
                <td>{Number(exp.amount).toFixed(2)}</td>
                <td>
                  {exp.receiptUpload ? (
                    <span className="receipt-cell">
                      <a
                        href={receiptUrl(exp.receiptUpload)}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Voir le justificatif"
                      >
                        <LuPaperclip />
                      </a>
                      <button
                        className="icon-btn"
                        onClick={() => handleDeleteReceipt(exp.id)}
                        aria-label="Supprimer le justificatif"
                      >
                        <LuTrash2 />
                      </button>
                    </span>
                  ) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ExpenseTable;
