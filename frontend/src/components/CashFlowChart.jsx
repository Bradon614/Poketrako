import { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import { getIncomes, getExpenses } from '../api';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const CashFlowChart = () => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Entrées (€)',
        data: [],
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
      {
        label: 'Sorties (€)',
        data: [],
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
      },
    ],
  });

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

        incomes.forEach(item => {
            const month = new Date(item.date).toLocaleString('default', { month: 'short', year: 'numeric' });
            if (!monthlyData[month]) monthlyData[month] = { income: 0, expense: 0 };
            monthlyData[month].income += item.amount;
        });

        expenses.forEach(item => {
            const month = new Date(item.date).toLocaleString('default', { month: 'short', year: 'numeric' });
            if (!monthlyData[month]) monthlyData[month] = { income: 0, expense: 0 };
            monthlyData[month].expense += item.amount;
        });

        const labels = Object.keys(monthlyData);
        const incomeData = labels.map(month => monthlyData[month].income);
        const expenseData = labels.map(month => monthlyData[month].expense);

        setChartData({
          labels,
          datasets: [
            {
              label: 'Entrées (€)',
              data: incomeData,
              backgroundColor: 'rgba(75, 192, 192, 0.6)',
            },
            {
              label: 'Sorties (€)',
              data: expenseData,
              backgroundColor: 'rgba(255, 99, 132, 0.6)',
            },
          ],
        });
      } catch (error) {
        console.error("Erreur de récupération des données du graphique :", error);
      }
    };
    fetchChartData();
  }, []);

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      tooltip: { mode: 'index', intersect: false },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  return (
    <div className="chart-container">
      <h3>Flux de trésorerie mensuel</h3>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default CashFlowChart;
