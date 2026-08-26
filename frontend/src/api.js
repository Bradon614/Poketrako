// Base URL of the Express API. Configure via frontend/.env (see .env.example).
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
// Uploaded files are served from the backend origin directly (no /api prefix).
const UPLOADS_BASE_URL = API_URL.replace(/\/api\/?$/, "");

function authHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, { method = "GET", body, params } = {}) {
  const query = params ? `?${new URLSearchParams(params)}` : "";

  const res = await fetch(`${API_URL}${path}${query}`, {
    method,
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: body !== undefined ? JSON.stringify(body) : undefined
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    throw new Error(data?.message || `Requête échouée (${res.status}) sur ${path}`);
  }

  return data;
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export async function signup(email, password, fullName) {
  return request("/auth/signup", { method: "POST", body: { email, password, fullName } });
}

export async function login(email, password) {
  const data = await request("/auth/login", { method: "POST", body: { email, password } });
  localStorage.setItem("token", data.token);
  return data;
}

export async function getProfile() {
  return request("/auth/me");
}

export function logout() {
  localStorage.removeItem("token");
}

export function isAuthenticated() {
  return Boolean(localStorage.getItem("token"));
}

// ---------------------------------------------------------------------------
// Expenses
// ---------------------------------------------------------------------------

export function getExpenses(params) {
  return request("/expenses", { params });
}

export function getExpense(id) {
  return request(`/expenses/${id}`);
}

export function createExpense(expense) {
  return request("/expenses", { method: "POST", body: expense });
}

export function updateExpense(id, expense) {
  return request(`/expenses/${id}`, { method: "PUT", body: expense });
}

export function deleteExpense(id) {
  return request(`/expenses/${id}`, { method: "DELETE" });
}

// ---------------------------------------------------------------------------
// Incomes
// ---------------------------------------------------------------------------

export function getIncomes(params) {
  return request("/incomes", { params });
}

export function getIncome(id) {
  return request(`/incomes/${id}`);
}

export function createIncome(income) {
  return request("/incomes", { method: "POST", body: income });
}

export function updateIncome(id, income) {
  return request(`/incomes/${id}`, { method: "PUT", body: income });
}

export function deleteIncome(id) {
  return request(`/incomes/${id}`, { method: "DELETE" });
}

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export function getCategories() {
  return request("/categories");
}

export function createCategory(name) {
  return request("/categories", { method: "POST", body: { name } });
}

export function updateCategory(id, name) {
  return request(`/categories/${id}`, { method: "PUT", body: { name } });
}

export function deleteCategory(id) {
  return request(`/categories/${id}`, { method: "DELETE" });
}

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------

export function getMonthlySummary(params) {
  return request("/summary/monthly", { params });
}

export function getSummary(params) {
  return request("/summary", { params });
}

export function getBudgetAlert() {
  return request("/summary/alerts");
}

export function updateBudget(budget) {
  return request("/auth/budget", { method: "PUT", body: { budget } });
}

export function updateCurrency(currency) {
  return request("/auth/currency", { method: "PUT", body: { currency } });
}

// ---------------------------------------------------------------------------
// Receipts
// ---------------------------------------------------------------------------

export function receiptUrl(receipt) {
  return `${UPLOADS_BASE_URL}${receipt.url}`;
}

export async function uploadReceipt(expenseId, file) {
  const formData = new FormData();
  formData.append("receipt", file);

  const res = await fetch(`${API_URL}/expenses/${expenseId}/receipt`, {
    method: "POST",
    headers: authHeaders(),
    body: formData
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    throw new Error(data?.message || `Requête échouée (${res.status})`);
  }

  return data;
}

export function deleteReceipt(expenseId) {
  return request(`/expenses/${expenseId}/receipt`, { method: "DELETE" });
}

export { API_URL, authHeaders };
