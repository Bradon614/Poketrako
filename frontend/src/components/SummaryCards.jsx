import { useState, useEffect } from 'react';
import { getMonthlySummary } from '../api';
import '../styles/SummaryCards.css';

const SummaryCards = () => {
  const [summary, setSummary] = useState({ income: 0, expenses: 0, balance: 0 });

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const data = await getMonthlySummary();
        setSummary(data);
      } catch (error) {
        console.error("Erreur de récupération du résumé mensuel :", error);
      }
    };
    fetchSummary();
  }, []);

  return (
    <div className="summary-cards">
      <div className="card">💰 Revenus: €{summary.income.toFixed(2)}</div>
      <div className="card">💸 Dépenses: €{summary.expenses.toFixed(2)}</div>
      <div className="card">📊 Solde: €{summary.balance.toFixed(2)}</div>
    </div>
  );
};

export default SummaryCards;
