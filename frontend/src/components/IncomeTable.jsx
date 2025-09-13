import { useState, useEffect } from 'react';
import { getIncomes } from '../api';
import '../styles/IncomeTable.css';

const IncomeTable = () => {
  const [incomes, setIncomes] = useState([]);

  useEffect(() => {
    const fetchIncomes = async () => {
      try {
        const data = await getIncomes({ _sort: 'date:DESC', _limit: 5 });
        setIncomes(data);
      } catch (error) {
        console.error("Erreur de récupération des revenus :", error);
      }
    };
    fetchIncomes();
  }, []);

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
              <td>{new Date(income.date).toLocaleDateString()}</td>
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
