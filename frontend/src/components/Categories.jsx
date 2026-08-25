import React, { useEffect, useState } from 'react';
import { API_URL, authHeaders } from '../api';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const res = await fetch(`${API_URL}/categories`, {
      headers: authHeaders()
    });
    const data = await res.json();
    setCategories(data);
  };

  const createCategory = async () => {
    const res = await fetch(`${API_URL}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ name: newName })
    });
    if (res.ok) {
      setNewName('');
      fetchCategories();
    }
  };

  const updateCategory = async (id) => {
    const res = await fetch(`${API_URL}/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ name: editName })
    });
    if (res.ok) {
      setEditingId(null);
      setEditName('');
      fetchCategories();
    }
  };

  const deleteCategory = async (id) => {
    const res = await fetch(`${API_URL}/categories/${id}`, {
      method: 'DELETE',
      headers: authHeaders()
    });
    if (res.ok) fetchCategories();
  };

  return (
    <div className="category-manager">
      <h3>Catégories</h3>
      <input
        type="text"
        placeholder="Nouvelle catégorie"
        value={newName}
        onChange={(e) => setNewName(e.target.value)}
      />
      <button onClick={createCategory}>Ajouter</button>

      <ul>
        {categories.map(cat => (
          <li key={cat.id}>
            {editingId === cat.id ? (
              <>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
                <button onClick={() => updateCategory(cat.id)}>Valider</button>
              </>
            ) : (
              <>
                {cat.name}
                <button onClick={() => {
                  setEditingId(cat.id);
                  setEditName(cat.name);
                }}>✏️</button>
                <button onClick={() => deleteCategory(cat.id)}>🗑️</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Categories;
