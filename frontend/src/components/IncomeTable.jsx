import React from 'react';
import '../styles/IncomeTable.css';

const IncomeTable = () => {
  // Données mock pour l'instant
  const incomes = [
    { id: 1, date: '2025-09-01', source: 'Salaire', amount: 2500.00, description: 'Mensuel' },
    { id: 2, date: '2025-09-05', source: 'Freelance', amount: 800.00, description: 'Projet React' },
    { id: 3, date: '2025-09-10', source: 'Remboursement', amount: 150.00, description: 'Achat partagé' },
  ];

  return (
    <div className="income-table-container">
      <h3>Revenus récents</h3>
      <table className="income-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Source</th>
            <th>Montant (€)</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {incomes.map(income => (
            <tr key={income.id}>
              <td>{income.date}</td>
              <td>{income.source}</td>
              <td>{income.amount.toFixed(2)}</td>
              <td>{income.description || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default IncomeTable;
