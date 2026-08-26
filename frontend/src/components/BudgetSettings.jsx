import { useEffect, useState } from 'react';
import { LuPencil, LuCheck, LuX } from 'react-icons/lu';
import { getMonthlySummary, updateBudget } from '../api';
import '../styles/BudgetSettings.css';

const BudgetSettings = () => {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchSummary = async () => {
    try {
      setSummary(await getMonthlySummary());
    } catch (err) {
      setError(err.message || 'Erreur de récupération du budget');
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const startEditing = () => {
    setValue(summary?.budget ? String(summary.budget) : '');
    setEditing(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await updateBudget(value === '' ? 0 : value);
      setEditing(false);
      await fetchSummary();
    } catch (err) {
      setError(err.message || 'Erreur lors de la mise à jour du budget');
    } finally {
      setSaving(false);
    }
  };

  if (error) return <p className="state-message state-error">{error}</p>;
  if (!summary) return <p className="state-message">Chargement du budget…</p>;

  const hasBudget = summary.budget > 0;
  const percent = hasBudget ? Math.min(100, (summary.expenses / summary.budget) * 100) : 0;
  const overBudget = hasBudget && summary.expenses > summary.budget;

  return (
    <div className="budget-settings card">
      <div className="budget-settings-header">
        <h3>Budget mensuel</h3>
        {!editing && (
          <button className="icon-btn" onClick={startEditing} aria-label="Modifier le budget">
            <LuPencil />
          </button>
        )}
      </div>

      {editing ? (
        <form className="budget-settings-form" onSubmit={handleSave}>
          <input
            className="field"
            type="number"
            step="0.01"
            min="0"
            placeholder="Montant (€)"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            autoFocus
          />
          <button type="submit" className="icon-btn" disabled={saving} aria-label="Valider">
            <LuCheck />
          </button>
          <button type="button" className="icon-btn" onClick={() => setEditing(false)} aria-label="Annuler">
            <LuX />
          </button>
        </form>
      ) : hasBudget ? (
        <>
          <p className="budget-settings-amount">
            €{summary.expenses.toFixed(2)} <span>/ €{summary.budget.toFixed(2)}</span>
          </p>
          <div className="budget-progress">
            <div
              className={`budget-progress-bar ${overBudget ? 'over' : ''}`}
              style={{ width: `${percent}%` }}
            />
          </div>
        </>
      ) : (
        <p className="state-message">Aucun budget défini pour ce mois.</p>
      )}
    </div>
  );
};

export default BudgetSettings;
