import { useEffect, useState } from 'react';
import { LuFolderPlus, LuPencil, LuTags, LuTrash2 } from 'react-icons/lu';
import { Button, Card, EmptyState, IconButton, Input, Modal } from '../../components/ui';
import { useCategories } from './useCategories';
import { getCategoryVisual, withAlpha } from '../../lib/categoryVisual';
import './Categories.css';

/**
 * CategoriesPage — a visual grid of category tiles.
 *
 * Each tile previews the icon and colour that category will use in every list
 * (both are derived from the name), so the grid doubles as a legend. Rename
 * and delete stay tucked inside the tile instead of a table row, and deletion
 * is confirmed.
 */

const CategoryFormModal = ({ open, category, onClose, onCreate, onUpdate, busy }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setName(category?.name || '');
    setError('');
  }, [open, category]);

  const handleSubmit = async (event) => {
    event?.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Le nom est requis');
      return;
    }
    if (trimmed.length > 100) {
      setError('100 caractères maximum');
      return;
    }
    try {
      if (category) await onUpdate(category.id, trimmed);
      else await onCreate(trimmed);
      onClose();
    } catch {
      // Failures are already surfaced as toasts by the hook.
    }
  };

  const visual = getCategoryVisual(name);
  const PreviewIcon = visual.icon;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={category ? 'Renommer la catégorie' : 'Nouvelle catégorie'}
      description="Le nom détermine l’icône et la couleur utilisées dans les listes."
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            Annuler
          </Button>
          <Button variant="primary" onClick={handleSubmit} loading={busy}>
            {category ? 'Enregistrer' : 'Créer'}
          </Button>
        </>
      }
    >
      <form className="modal-form" onSubmit={handleSubmit} noValidate>
        <div className="cat-preview">
          <span
            className="cat-preview__well"
            style={{ background: withAlpha(visual.color, 0.14), color: visual.color }}
            aria-hidden="true"
          >
            <PreviewIcon />
          </span>
          <span className="cat-preview__text">
            <strong>{name.trim() || 'Aperçu'}</strong>
            <em>Icône et couleur générées automatiquement</em>
          </span>
        </div>

        <Input
          label="Nom de la catégorie"
          name="name"
          placeholder="Alimentation, Transport, Loisirs…"
          value={name}
          onChange={(event) => setName(event.target.value)}
          error={error}
          maxLength={100}
          autoFocus
        />
      </form>
    </Modal>
  );
};

const CategoriesPage = () => {
  const { categories, loading, error, busy, create, update, remove } = useCategories();
  const [modal, setModal] = useState({ open: false, category: null });

  const isEmpty = !loading && categories.length === 0;

  return (
    <>
      <div className="page-head">
        <div>
          <h2 className="page-title">Vos catégories</h2>
          <p className="page-subtitle">
            {categories.length > 0
              ? `${categories.length} catégorie${categories.length > 1 ? 's' : ''} pour classer vos dépenses`
              : 'Organisez vos dépenses par thème'}
          </p>
        </div>
        <Button variant="primary" icon={LuFolderPlus} onClick={() => setModal({ open: true, category: null })}>
          Nouvelle catégorie
        </Button>
      </div>

      {error && (
        <p className="hint" role="alert">
          {error}
        </p>
      )}

      {loading && categories.length === 0 ? (
        <ul className="cat-grid">
          {Array.from({ length: 6 }).map((_, index) => (
            <li key={index}>
              <Card className="cat-tile">
                <span className="skeleton" style={{ width: 44, height: 44, borderRadius: 'var(--r-md)' }} aria-hidden="true" />
                <span className="skeleton" style={{ width: '60%', height: 13, marginTop: 12 }} aria-hidden="true" />
              </Card>
            </li>
          ))}
        </ul>
      ) : isEmpty ? (
        <Card>
          <EmptyState
            icon={LuTags}
            title="Aucune catégorie"
            message="Créez votre première catégorie (Alimentation, Transport, Logement…) pour organiser vos dépenses et lire votre répartition d’un coup d’œil."
            action={
              <Button variant="primary" icon={LuFolderPlus} onClick={() => setModal({ open: true, category: null })}>
                Créer une catégorie
              </Button>
            }
          />
        </Card>
      ) : (
        <ul className="cat-grid">
          {categories.map((category, index) => {
            const visual = getCategoryVisual(category.name);
            const Icon = visual.icon;
            return (
              <li key={category.id}>
                <Card className="cat-tile rise" style={{ animationDelay: `${Math.min(index, 8) * 28}ms` }}>
                  <span
                    className="cat-tile__well"
                    style={{ background: withAlpha(visual.color, 0.14), color: visual.color }}
                    aria-hidden="true"
                  >
                    <Icon />
                  </span>

                  <div className="cat-tile__body">
                    <p className="cat-tile__name" title={category.name}>
                      {category.name}
                    </p>
                    <p className="cat-tile__meta">
                      Créée le {new Date(category.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>

                  <div className="cat-tile__actions">
                    <IconButton
                      icon={LuPencil}
                      label={`Renommer ${category.name}`}
                      size="sm"
                      onClick={() => setModal({ open: true, category })}
                    />
                    <IconButton
                      icon={LuTrash2}
                      label={`Supprimer ${category.name}`}
                      size="sm"
                      variant="danger"
                      onClick={() => remove(category)}
                    />
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      )}

      <CategoryFormModal
        open={modal.open}
        category={modal.category}
        busy={busy}
        onClose={() => setModal({ open: false, category: null })}
        onCreate={create}
        onUpdate={update}
      />
    </>
  );
};

export default CategoriesPage;
