// Base URL of the Express API. Configure via frontend/.env (see .env.example).
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function authHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Minimal shared GET helper. The full API client is rebuilt in a later phase.
async function getJSON(path, params) {
  const query = params ? `?${new URLSearchParams(params)}` : "";

  const res = await fetch(`${API_URL}${path}${query}`, {
    headers: { "Content-Type": "application/json", ...authHeaders() },
  });

  if (!res.ok) {
    throw new Error(`Requête échouée (${res.status}) sur ${path}`);
  }

  return res.json();
}

export async function signup(email, password) {
  const res = await fetch(`${API_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  if (!res.ok) {
    throw new Error("Erreur d'inscription");
  }

  return true;
}

export async function login(email, password) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  if (!res.ok) throw new Error("Identifiants incorrects");

  const data = await res.json();
  localStorage.setItem("token", data.token);
  return data;
}

export async function getProfile() {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Utilisateur non connecté");

  return getJSON("/auth/me");
}

export function logout() {
  localStorage.removeItem("token");
}

// ---------------------------------------------------------------------------
// The endpoints below are not mounted on the backend yet (see Phase 2).
// They exist so the components that already import them can compile.
// ---------------------------------------------------------------------------

export function getExpenses(params) {
  return getJSON("/expenses", params);
}

export function getIncomes(params) {
  return getJSON("/incomes", params);
}

export function getMonthlySummary(params) {
  return getJSON("/summary/monthly", params);
}

export function getBudgetAlert() {
  return getJSON("/summary/alerts");
}

export { API_URL, authHeaders };
