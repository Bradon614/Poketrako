const API_URL = "http://localhost:5000/api";

export async function signup(email, password) {
  const res = await fetch(`${API_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Erreur signup:", text);
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

  const text = await res.text();
  console.log("Réponse login:", res.status, text);

  if (!res.ok) throw new Error("Identifiants incorrects ❌");

  const data = JSON.parse(text);
  localStorage.setItem("token", data.token);
  return data;
}

export async function getProfile() {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Utilisateur non connecté");

  const res = await fetch(`${API_URL}/auth/me`, {
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });

  const text = await res.text();
  if (!res.ok) {
    console.error("Erreur getProfile:", text);
    throw new Error("Impossible de récupérer le profil");
  }

  return JSON.parse(text);
}

export function logout() {
  localStorage.removeItem("token");
}
