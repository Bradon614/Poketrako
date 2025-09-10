const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const prisma = new PrismaClient();

async function signup(req, res) {
  try {
    const { email, password } = req.body;
    console.log("Signup attempt:", { email, password });

    if (!email || !password) return res.status(400).json({ message: "Email et mot de passe requis" });

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ message: "Utilisateur déjà existant" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { email, password: hashedPassword },
    });

    console.log("User created:", user);
    res.status(201).json({ message: "Utilisateur créé", userId: user.id });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Erreur serveur lors de la création" });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    console.log("Login attempt:", { email, password });

    const user = await prisma.user.findUnique({ where: { email } });
    console.log("User found:", user);

    if (!user) return res.status(401).json({ message: "Utilisateur introuvable" });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ message: "Mot de passe incorrect" });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.json({ token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Erreur serveur lors de la connexion" });
  }
}

async function getMe(req, res) {
  try {
    const userId = req.userId; // depuis ton middleware d'auth
    const user = await prisma.user.findUnique({ where: { id: userId } });
    res.json({ email: user.email, id: user.id });
  } catch (err) {
    console.error("GetMe error:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
}

module.exports = { signup, login, getMe };
