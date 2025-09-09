const API_URL = "http://localhost:5000/api";

export async function signup(username, email, password) {
  const res = await fetch(`${API_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password })
  });

  if (!res.ok) throw new Error("Erreur d'inscription");
}

export async function login(email, password) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  if (!res.ok) throw new Error("Erreur de connexion");
  const data = await res.json();
  localStorage.setItem("token", data.token);
}

export async function getProfile() {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/auth/me`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  if (!res.ok) throw new Error("Erreur de récupération du profil");
  return await res.json();
}
