import '../styles/SummaryCards.css'

const SummaryCards = () => {
  // Tu peux remplacer ces valeurs par des appels API plus tard
  const income = 6872.20;
  const expenses = 2378.20;
  const balance = income - expenses;

  return (
    <div className="summary-cards">
      <div className="card">💰 Revenus: €{income.toFixed(2)}</div>
      <div className="card">💸 Dépenses: €{expenses.toFixed(2)}</div>
      <div className="card">📊 Solde: €{balance.toFixed(2)}</div>
    </div>
  );
};

export default SummaryCards;
