import { useState } from 'react';
import { API_URL, authHeaders } from '../api';

const AddExpense = () => {
  const [form, setForm] = useState({
    title: '',
    amount: '',
    categoryId: '',
    date: '',
    type: 'ONE_TIME',
    description: '',
    receipt: null
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFile = (e) => {
    setForm((prev) => ({ ...prev, receipt: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value) data.append(key, value);
    });

    try {
      // Content-Type is set automatically by the browser for FormData.
      const res = await fetch(`${API_URL}/expenses`, {
        method: 'POST',
        headers: authHeaders(),
        body: data
      });
      if (!res.ok) throw new Error(`Requête échouée (${res.status})`);
      alert('Dépense enregistrée avec justificatif');
    } catch (err) {
      console.error('Erreur:', err);
      alert(`Échec de l'enregistrement : ${err.message}`);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="title" placeholder="Titre" onChange={handleChange} />
      <input name="amount" type="number" placeholder="Montant" onChange={handleChange} />
      <input name="date" type="date" onChange={handleChange} />
      <select name="categoryId" onChange={handleChange}>
        <option value="">Catégorie</option>
        <option value="1">Transport</option>
        <option value="2">Nourriture</option>
        {/* à remplacer par un fetch dynamique */}
      </select>
      <textarea name="description" placeholder="Description" onChange={handleChange} />
      <input name="receipt" type="file" accept=".jpg,.png,.pdf" onChange={handleFile} />
      <button type="submit">Ajouter</button>
    </form>
  );
};

export default AddExpense;
