import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getExpenses } from '../api';
import '../styles/ExpenseTable.css';

const ExpenseTable = () => {
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const data = await getExpenses({ _sort: 'date:DESC', _limit: 5 });
        setExpenses(data);
      } catch (error) {
        console.error("Erreur de récupération des dépenses :", error);
      }
    };
    fetchExpenses();
  }, []);

  return (
    <div className="expense-table-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>Activité récente</h3>
        <Link to="/expenses/new">+ Nouvelle dépense</Link>
      </div>
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
    </div>
  );
};

export default ExpenseTable;
