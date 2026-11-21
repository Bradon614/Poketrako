import { useCallback, useMemo, useState } from 'react';
import { createCategory, deleteCategory, getCategories, updateCategory } from '../../api';
import { useAsync } from '../../lib/hooks';
import { useToast } from '../../lib/toast';
import { useConfirm } from '../../components/ui';

/**
 * useCategories — the shared category list plus its mutations.
 *
 * The dashboard (expense form), the categories page and the expense modal all
 * need the same list, so fetch + create/rename/delete live here once, with
 * confirmation on delete (which the previous implementation didn't ask for).
 */

export function useCategories() {
  const state = useAsync(() => getCategories(), []);
  const { success, error: toastError } = useToast();
  const confirm = useConfirm();
  const [busy, setBusy] = useState(false);

  const create = useCallback(
    async (name) => {
      setBusy(true);
      try {
        await createCategory(name);
        success('Catégorie créée.');
        await state.refetch({ quiet: true });
      } catch (error) {
        toastError(error?.message || 'Impossible de créer la catégorie');
        throw error;
      } finally {
        setBusy(false);
      }
    },
    [state, success, toastError]
  );

  const update = useCallback(
    async (id, name) => {
      setBusy(true);
      try {
        await updateCategory(id, name);
        success('Catégorie renommée.');
        await state.refetch({ quiet: true });
      } catch (error) {
        toastError(error?.message || 'Impossible de renommer la catégorie');
        throw error;
      } finally {
        setBusy(false);
      }
    },
    [state, success, toastError]
  );

  const remove = useCallback(
    async (category) => {
      const confirmed = await confirm({
        title: `Supprimer « ${category.name} » ?`,
        message:
          'La catégorie sera supprimée. Les dépenses rattachées perdent leur classement mais restent dans votre historique.',
        confirmLabel: 'Supprimer',
        destructive: true,
      });
      if (!confirmed) return false;

      setBusy(true);
      try {
        await deleteCategory(category.id);
        success('Catégorie supprimée.');
        await state.refetch({ quiet: true });
        return true;
      } catch (error) {
        toastError(error?.message || 'Impossible de supprimer la catégorie');
        return false;
      } finally {
        setBusy(false);
      }
    },
    [confirm, state, success, toastError]
  );

  const categories = useMemo(() => {
    const list = Array.isArray(state.data) ? [...state.data] : [];
    return list.sort((a, b) => a.name.localeCompare(b.name, 'fr'));
  }, [state.data]);

  return {
    categories,
    loading: state.loading,
    error: state.error,
    busy,
    refetch: state.refetch,
    create,
    update,
    remove,
  };
}
