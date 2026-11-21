export interface User {
  id: number;
  email: string;
  fullName?: string;
  budget: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: number;
  name: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export type ExpenseType = 'ONE_TIME' | 'RECURRING';

export interface Expense {
  id: number;
  amount: string;
  date?: string;
  categoryId?: number;
  category?: Category;
  description?: string;
  type: ExpenseType;
  creationDate: string;
  startDate?: string;
  endDate?: string;
  userId: number;
  receiptUploadId?: number;
  receiptUpload?: ReceiptUpload;
}

export interface Income {
  id: number;
  amount: string;
  date: string;
  source: string;
  description?: string;
  creationDate: string;
  userId: number;
}

export interface ReceiptUpload {
  id: number;
  filename: string;
  url: string;
  contentType: string;
  size: number;
  uploadedAt: string;
  userId: number;
}

export interface AuthResponse {
  token?: string;
  message?: string;
  userId?: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  fullName?: string;
}

export interface MeResponse {
  email: string;
  id: number;
  budget: number;
  currency: string;
  fullName?: string;
}

export interface UpdateBudgetRequest {
  budget: number;
}

export interface UpdateCurrencyRequest {
  currency: string;
}

export interface ExpenseQueryParams {
  start?: string;
  end?: string;
  categoryId?: number;
  type?: ExpenseType;
  _sort?: string;
  _limit?: number;
}

export interface IncomeQueryParams {
  start?: string;
  end?: string;
  _sort?: string;
  _limit?: number;
}

export interface CreateExpenseRequest {
  amount: number;
  date?: string;
  categoryId?: number;
  description?: string;
  type?: ExpenseType;
  startDate?: string;
  endDate?: string;
}

export interface UpdateExpenseRequest {
  amount?: number;
  date?: string;
  categoryId?: number;
  description?: string;
  type?: ExpenseType;
  startDate?: string;
  endDate?: string;
}

export interface CreateIncomeRequest {
  amount: number;
  date: string;
  source: string;
  description?: string;
}

export interface UpdateIncomeRequest {
  amount?: number;
  date?: string;
  source?: string;
  description?: string;
}

export interface CreateCategoryRequest {
  name: string;
}

export interface UpdateCategoryRequest {
  name: string;
}

export interface MonthlySummaryResponse {
  month: string;
  income: number;
  expenses: number;
  balance: number;
  budget: number;
}

export interface SummaryResponse {
  startDate: string;
  endDate: string;
  income: number;
  expenses: number;
  balance: number;
}

export interface AlertResponse {
  alert: boolean;
  message: string;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: unknown;
}

export interface PaginatedResponse<T> {
  data: T[];
  total?: number;
  page?: number;
  limit?: number;
}