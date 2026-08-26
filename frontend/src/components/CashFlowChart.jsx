import { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import { getIncomes, getExpenses } from '../api';
import { useCurrency } from '../context/CurrencyContext';
import { formatMoney } from '../currency';
import '../styles/CashFlowChart.css';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

// Canvas rendering can't resolve CSS custom properties, so the chart series
// colors are literal values kept in sync with --color-chart-income/expense
// in styles/theme.css.
const COLOR_INCOME = 'rgba(52, 211, 153, 0.8)';
const COLOR_EXPENSE = 'rgba(248, 113, 113, 0.8)';
const COLOR_TEXT_MUTED = '#9797b3';
const COLOR_GRID = 'rgba(255, 255, 255, 0.08)';

const emptyChartData = {
  labels: [],
  datasets: [
    { label: 'Entrées', data: [], backgroundColor: COLOR_INCOME },
    { label: 'Sorties', data: [], backgroundColor: COLOR_EXPENSE },
  ],
};

const CashFlowChart = () => {
  const { currency } = useCurrency();
  const [chartData, setChartData] = useState(emptyChartData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const params = { start: sixMonthsAgo.toISOString().split('T')[0] };

        const [incomes, expenses] = await Promise.all([
          getIncomes(params),
          getExpenses(params)
        ]);

        const monthlyData = {};

        // Expenses can have no date (categoryId/date are both optional), so
        // skip anything without one instead of bucketing it under 1970.
        incomes.filter(item => item.date).forEach(item => {
          const month = new Date(item.date).toLocaleString('default', { month: 'short', year: 'numeric' });
          if (!monthlyData[month]) monthlyData[month] = { income: 0, expense: 0 };
          monthlyData[month].income += Number(item.amount);
        });

        expenses.filter(item => item.date).forEach(item => {
          const month = new Date(item.date).toLocaleString('default', { month: 'short', year: 'numeric' });
          if (!monthlyData[month]) monthlyData[month] = { income: 0, expense: 0 };
          monthlyData[month].expense += Number(item.amount);
        });

        const labels = Object.keys(monthlyData);

        setChartData({
          labels,
          datasets: [
            { label: 'Entrées', data: labels.map(m => monthlyData[m].income), backgroundColor: COLOR_INCOME },
            { label: 'Sorties', data: labels.map(m => monthlyData[m].expense), backgroundColor: COLOR_EXPENSE },
          ],
        });
      } catch (err) {
        setError(err.message || 'Erreur de récupération des données du graphique');
      } finally {
        setLoading(false);
      }
    };
    fetchChartData();
  }, []);

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top', labels: { color: COLOR_TEXT_MUTED } },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: ${formatMoney(ctx.parsed.y, currency)}`
        }
      },
    },
    scales: {
      x: { ticks: { color: COLOR_TEXT_MUTED }, grid: { color: COLOR_GRID } },
      y: { beginAtZero: true, ticks: { color: COLOR_TEXT_MUTED }, grid: { color: COLOR_GRID } },
    },
  };

  return (
    <div className="chart-container card">
      <h3>Flux de trésorerie mensuel</h3>
      {error && <p className="state-message state-error">{error}</p>}
      {!error && loading && <p className="state-message">Chargement…</p>}
      {!error && !loading && chartData.labels.length === 0 && (
        <p className="state-message">Pas encore de données sur les 6 derniers mois.</p>
      )}
      {!error && !loading && chartData.labels.length > 0 && (
        <Bar data={chartData} options={options} />
      )}
    </div>
  );
};

export default CashFlowChart;
