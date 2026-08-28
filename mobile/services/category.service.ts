import { api } from './api';
import { Category, CreateCategoryRequest, UpdateCategoryRequest } from '@/types/api';

export const categoryService = {
  async getCategories(): Promise<Category[]> {
    return api.get<Category[]>('/categories');
  },

  async createCategory(data: CreateCategoryRequest): Promise<Category> {
    return api.post<Category>('/categories', data);
  },

  async updateCategory(id: number, data: UpdateCategoryRequest): Promise<{ message: string }> {
    return api.put<{ message: string }>(`/categories/${id}`, data);
  },

  async deleteCategory(id: number): Promise<void> {
    return api.delete<void>(`/categories/${id}`);
  },
};