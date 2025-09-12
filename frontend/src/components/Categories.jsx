import React, { useEffect, useState } from 'react';

const Categories = ({ token }) => {
  const [categories, setCategories] = useState([]);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const res = await fetch('http://localhost:5000/api/categories', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setCategories(data);
  };

  const createCategory = async () => {
    const res = await fetch('http://localhost:5000/api/categories', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: newName })
    });
    if (res.ok) {
      setNewName('');
      fetchCategories();
    }
  };

  const updateCategory = async (id) => {
    const res = await fetch(`http://localhost:5000/api/categories/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: editName })
    });
    if (res.ok) {
      setEditingId(null);
      setEditName('');
      fetchCategories();
    }
  };

  const deleteCategory = async (id) => {
    const res = await fetch(`http://localhost:5000/api/categories/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
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
