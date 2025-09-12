import React from 'react';
import '../styles/ExpenseTable.css';

const ExpenseTable = () => {
  // Données mock pour l'instant
  const expenses = [
    { id: 1, date: '2025-09-01', title: 'Courses', amount: 120.50, status: 'completed' },
    { id: 2, date: '2025-09-03', title: 'Abonnement Netflix', amount: 15.99, status: 'pending' },
    { id: 3, date: '2025-09-05', title: 'Essence', amount: 45.00, status: 'completed' },
  ];

  return (
    <div className="expense-table-container">
      <h3>Activité récente</h3>
      <table className="expense-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Description</th>
            <th>Montant (€)</th>
            <th>Statut</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map(exp => (
            <tr key={exp.id}>
              <td>{exp.date}</td>
              <td>{exp.title}</td>
              <td>{exp.amount.toFixed(2)}</td>
              <td className={exp.status === 'completed' ? 'status-completed' : 'status-pending'}>
                {exp.status === 'completed' ? '✅ Terminé' : '🕒 En attente'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ExpenseTable;
