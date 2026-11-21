import { useState, useEffect, useCallback } from 'react';
import { categoryService } from '@/services/category.service';
import { Category, CreateCategoryRequest, UpdateCategoryRequest } from '@/types/api';

interface UseCategoriesResult {
  categories: Category[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  create: (data: CreateCategoryRequest) => Promise<Category>;
  update: (id: number, data: UpdateCategoryRequest) => Promise<void>;
  remove: (id: number) => Promise<void>;
}

export function useCategories(): UseCategoriesResult {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await categoryService.getCategories();
      setCategories(data);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des catégories');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const create = async (data: CreateCategoryRequest) => {
    setError(null);
    try {
      const result = await categoryService.createCategory(data);
      await fetchCategories();
      return result;
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création');
      throw err;
    }
  };

  const update = async (id: number, data: UpdateCategoryRequest) => {
    setError(null);
    try {
      await categoryService.updateCategory(id, data);
      await fetchCategories();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la mise à jour');
      throw err;
    }
  };

  const remove = async (id: number) => {
    setError(null);
    try {
      await categoryService.deleteCategory(id);
      await fetchCategories();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la suppression');
      throw err;
    }
  };

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories,
    create,
    update,
    remove,
  };
}