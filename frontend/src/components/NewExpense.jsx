import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createExpense, getCategories } from '../api';
import '../styles/NewExpense.css';

const EXPENSE_TYPES = [
  { value: 'ONE_TIME', label: 'Ponctuelle' },
  { value: 'RECURRING', label: 'Récurrente' }
];

const NewExpense = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    amount: '',
    date: '',
    categoryId: '',
    description: '',
    type: 'ONE_TIME',
    startDate: '',
    endDate: ''
  });
  const [error, setError] = useState('');
  const [categoriesError, setCategoriesError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch((err) => setCategoriesError(err.message || 'Erreur de récupération des catégories'));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await createExpense({
        amount: form.amount,
        date: form.date || undefined,
        categoryId: form.categoryId || undefined,
        description: form.description || undefined,
        type: form.type,
        startDate: form.type === 'RECURRING' ? form.startDate || undefined : undefined,
        endDate: form.type === 'RECURRING' ? form.endDate || undefined : undefined
      });
      navigate('/expenses');
    } catch (err) {
      setError(err.message || 'Erreur lors de la création de la dépense');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="expense-form" onSubmit={handleSubmit}>
      <h3>Nouvelle dépense</h3>

      {error && <p className="form-error">{error}</p>}

      <input
        className="field"
        type="number"
        step="0.01"
        min="0.01"
        name="amount"
        placeholder="Montant (€)"
        value={form.amount}
        onChange={handleChange}
        required
      />
      <input className="field" type="date" name="date" value={form.date} onChange={handleChange} />

      <select className="field" name="categoryId" value={form.categoryId} onChange={handleChange}>
        <option value="">Sans catégorie</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>{cat.name}</option>
        ))}
      </select>
      {categoriesError && <p className="form-error">Catégories indisponibles : {categoriesError}</p>}

      <input
        className="field"
        type="text"
        name="description"
        placeholder="Description (optionnel)"
        value={form.description}
        onChange={handleChange}
      />

      <select className="field" name="type" value={form.type} onChange={handleChange}>
        {EXPENSE_TYPES.map((t) => (
          <option key={t.value} value={t.value}>{t.label}</option>
        ))}
      </select>

      {form.type === 'RECURRING' && (
        <>
          <label>Début</label>
          <input className="field" type="date" name="startDate" value={form.startDate} onChange={handleChange} required />
          <label>Fin (optionnel)</label>
          <input className="field" type="date" name="endDate" value={form.endDate} onChange={handleChange} />
        </>
      )}

      <button type="submit" className="btn btn-primary" disabled={submitting}>
        {submitting ? 'Enregistrement…' : 'Ajouter'}
      </button>
    </form>
  );
};

export default NewExpense;
