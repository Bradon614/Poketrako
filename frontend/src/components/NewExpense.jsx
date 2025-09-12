import React, { useState } from 'react';
import '../styles/NewExpense.css';

const NewExpense = ({ token }) => {
  const [form, setForm] = useState({
    amount: '',
    date: '',
    categoryId: '',
    description: '',
    type: 'one-time',
    startDate: '',
    endDate: '',
    receipt: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value) data.append(key, value);
    });

    try {
      const res = await fetch('http://localhost:5000/api/expenses', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: data
      });
      if (!res.ok) throw new Error('Erreur lors de la création');
      alert('Dépense enregistrée ');
    } catch (err) {
      console.error(err);
      alert('Erreur : ' + err.message);
    }
  };

  return (
    <form className="expense-form" onSubmit={handleSubmit}>
      <h3>Nouvelle dépense</h3>
      <input type="number" name="amount" placeholder="Montant (€)" onChange={handleChange} required />
      <input type="date" name="date" onChange={handleChange} required />
      <input type="text" name="categoryId" placeholder="ID catégorie" onChange={handleChange} required />
      <input type="text" name="description" placeholder="Description (optionnel)" onChange={handleChange} />
      
      <select name="type" onChange={handleChange}>
        <option value="one-time">Ponctuelle</option>
        <option value="recurring">Récurrente</option>
      </select>

      {form.type === 'recurring' && (
        <>
          <label>Début</label>
          <input type="date" name="startDate" onChange={handleChange} required />
          <label>Fin (optionnel)</label>
          <input type="date" name="endDate" onChange={handleChange} />
        </>
      )}

      <label>Justificatif (PDF, JPG, PNG)</label>
      <input type="file" name="receipt" accept=".pdf,.jpg,.jpeg,.png" onChange={handleChange} />

      <button type="submit">Ajouter</button>
    </form>
  );
};

export default NewExpense;
