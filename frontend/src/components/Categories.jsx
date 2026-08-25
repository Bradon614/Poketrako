import { useEffect, useState } from 'react';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../api';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setCategories(await getCategories());
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setError('');
    try {
      await createCategory(newName.trim());
      setNewName('');
      fetchCategories();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdate = async (id) => {
    if (!editName.trim()) return;
    setError('');
    try {
      await updateCategory(id, editName.trim());
      setEditingId(null);
      setEditName('');
      fetchCategories();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    setError('');
    try {
      await deleteCategory(id);
      fetchCategories();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="category-manager">
      <h3>Catégories</h3>
      {error && <p className="error">{error}</p>}
      <input
        type="text"
        placeholder="Nouvelle catégorie"
        value={newName}
        onChange={(e) => setNewName(e.target.value)}
      />
      <button onClick={handleCreate}>Ajouter</button>

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
                <button onClick={() => handleUpdate(cat.id)}>Valider</button>
              </>
            ) : (
              <>
                {cat.name}
                <button onClick={() => {
                  setEditingId(cat.id);
                  setEditName(cat.name);
                }}>✏️</button>
                <button onClick={() => handleDelete(cat.id)}>🗑️</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Categories;
