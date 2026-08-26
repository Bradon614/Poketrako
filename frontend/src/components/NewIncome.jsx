import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createIncome } from '../api';
import '../styles/EntityForm.css';

const NewIncome = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    amount: '',
    date: '',
    source: '',
    description: ''
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await createIncome({
        amount: form.amount,
        date: form.date,
        source: form.source,
        description: form.description || undefined
      });
      navigate('/incomes');
    } catch (err) {
      setError(err.message || 'Erreur lors de la création du revenu');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="entity-form" onSubmit={handleSubmit}>
      <h3>Nouveau revenu</h3>

      {error && <p className="form-error">{error}</p>}

      <input
        className="field"
        type="number"
        step="0.01"
        min="0.01"
        name="amount"
        placeholder="Montant"
        value={form.amount}
        onChange={handleChange}
        required
      />
      <input
        className="field"
        type="date"
        name="date"
        value={form.date}
        onChange={handleChange}
        required
      />
      <input
        className="field"
        type="text"
        name="source"
        placeholder="Source (ex : Salaire, Prime…)"
        value={form.source}
        onChange={handleChange}
        required
      />
      <input
        className="field"
        type="text"
        name="description"
        placeholder="Description (optionnel)"
        value={form.description}
        onChange={handleChange}
      />

      <button type="submit" className="btn btn-primary" disabled={submitting}>
        {submitting ? 'Enregistrement…' : 'Ajouter'}
      </button>
    </form>
  );
};

export default NewIncome;
