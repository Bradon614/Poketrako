import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const CashFlowChart = () => {
  // Données mock pour l'instant
  const data = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Entrées (€)',
        data: [1200, 1500, 1800, 1300, 1700, 1600],
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
      {
        label: 'Sorties (€)',
        data: [800, 900, 1100, 950, 1200, 1000],
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
      },
    ],
  };

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
      <Bar data={data} options={options} />
    </div>
  );
};

export default CashFlowChart;
