import { useMemo, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Tooltip } from 'chart.js';
import { SectionCard, SegmentedControl, SkeletonChart } from '../../components/ui';
import { formatMoney } from '../../currency';
import { useTheme } from '../../lib/theme';
import { useThemeChartColors } from '../../lib/hooks';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

/**
 * CashFlowChart — income vs expenses per month.
 *
 * Chart.js draws into a canvas, which cannot resolve CSS custom properties,
 * so the palette is read from the document at runtime and recomputed when the
 * theme flips. That keeps the chart in sync with the rest of the UI instead of
 * hardcoding one theme's colours.
 */

const RANGES = [
  { value: 3, label: '3 mois' },
  { value: 6, label: '6 mois' },
];

const CashFlowChart = ({ series = [], currency, loading = false }) => {
  const [range, setRange] = useState(6);
  const { isDark } = useTheme();
  const colors = useThemeChartColors(isDark);

  const visible = useMemo(() => series.slice(-range), [series, range]);

  const data = useMemo(
    () => ({
      labels: visible.map((point) => point.label),
      datasets: [
        {
          label: 'Revenus',
          data: visible.map((point) => point.income),
          backgroundColor: colors.income,
          borderRadius: 6,
          borderSkipped: false,
          maxBarThickness: 22,
        },
        {
          label: 'Dépenses',
          data: visible.map((point) => point.expense),
          backgroundColor: colors.expense,
          borderRadius: 6,
          borderSkipped: false,
          maxBarThickness: 22,
        },
      ],
    }),
    [visible, colors]
  );

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 420, easing: 'easeOutQuart' },
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          position: 'top',
          align: 'end',
          labels: {
            color: colors.tick,
            boxWidth: 9,
            boxHeight: 9,
            usePointStyle: true,
            pointStyle: 'circle',
            font: { size: 12, family: 'inherit' },
          },
        },
        tooltip: {
          padding: 12,
          backgroundColor: isDark ? 'rgba(20,22,27,0.94)' : 'rgba(255,255,255,0.96)',
          titleColor: colors.tick,
          bodyColor: isDark ? '#f5f7fa' : '#0b1220',
          borderColor: colors.grid,
          borderWidth: 1,
          cornerRadius: 12,
          displayColors: true,
          boxWidth: 8,
          boxHeight: 8,
          usePointStyle: true,
          callbacks: {
            label: (context) => ` ${context.dataset.label} : ${formatMoney(context.parsed.y, currency)}`,
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          border: { display: false },
          ticks: { color: colors.tick, font: { size: 12 } },
        },
        y: {
          beginAtZero: true,
          grid: { color: colors.grid, drawTicks: false },
          border: { display: false },
          ticks: {
            color: colors.tick,
            font: { size: 11 },
            padding: 8,
            maxTicksLimit: 5,
            callback: (value) => compact(value, currency),
          },
        },
      },
    }),
    [colors, currency, isDark]
  );

  const hasData = visible.some((point) => point.income > 0 || point.expense > 0);
  const totalIncome = visible.reduce((sum, point) => sum + point.income, 0);
  const totalExpense = visible.reduce((sum, point) => sum + point.expense, 0);

  return (
    <SectionCard
      title="Flux de trésorerie"
      subtitle={hasData ? `${visible.length} derniers mois · solde ${formatMoney(totalIncome - totalExpense, currency)}` : undefined}
      action={<SegmentedControl options={RANGES} value={range} onChange={setRange} label="Période du graphique" size="sm" className="segmented--keep-labels" />}
    >
      <div className="chart">
        {loading ? (
          <SkeletonChart height={248} />
        ) : hasData ? (
          <Bar data={data} options={options} />
        ) : (
          <p className="chart__empty">
            Aucune opération sur cette période. Ajoutez une dépense ou un revenu pour voir votre
            évolution.
          </p>
        )}
      </div>
    </SectionCard>
  );
};

/** 1 200 000 → "1,2 M" so the axis stays readable. */
function compact(value, currency) {
  const number = Number(value) || 0;
  const abs = Math.abs(number);
  const suffix = currency === 'MGA' ? ' Ar' : '';
  if (abs >= 1_000_000_000) return `${(number / 1_000_000_000).toFixed(1)} Md${suffix}`;
  if (abs >= 1_000_000) return `${(number / 1_000_000).toFixed(1)} M${suffix}`;
  if (abs >= 1_000) return `${Math.round(number / 1_000)} k${suffix}`;
  return `${number}${suffix}`;
}

export default CashFlowChart;
