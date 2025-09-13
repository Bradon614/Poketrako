import { useState, useEffect } from 'react';
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
      <h3>Activité récente</h3>
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
              <td>{new Date(exp.date).toLocaleDateString()}</td>
              <td>{exp.description}</td>
              <td>{exp.amount.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ExpenseTable;
