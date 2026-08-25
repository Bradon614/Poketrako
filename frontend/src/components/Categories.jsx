import { useEffect, useState } from 'react';
import { LuCheck, LuPencil, LuTrash2 } from 'react-icons/lu';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../api';
import '../styles/Categories.css';

const Categories = () => {
  const [categories, setCategories] = useState(null);
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

  const handleCreate = async (e) => {
    e.preventDefault();
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
      {error && <p className="form-error">{error}</p>}

      <form className="add-row" onSubmit={handleCreate}>
        <input
          className="field"
          type="text"
          placeholder="Nouvelle catégorie"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <button type="submit" className="btn btn-primary btn-sm">Ajouter</button>
      </form>

      {!categories && <p className="state-message">Chargement…</p>}
      {categories && categories.length === 0 && (
        <p className="state-message">Aucune catégorie pour l'instant.</p>
      )}

      {categories && categories.length > 0 && (
        <ul>
          {categories.map(cat => (
            <li key={cat.id}>
              {editingId === cat.id ? (
                <>
                  <input
                    className="field"
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                  <div className="actions">
                    <button onClick={() => handleUpdate(cat.id)} aria-label="Valider"><LuCheck /></button>
                  </div>
                </>
              ) : (
                <>
                  <span>{cat.name}</span>
                  <div className="actions">
                    <button onClick={() => { setEditingId(cat.id); setEditName(cat.name); }} aria-label="Modifier"><LuPencil /></button>
                    <button onClick={() => handleDelete(cat.id)} aria-label="Supprimer"><LuTrash2 /></button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Categories;
