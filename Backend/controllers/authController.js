const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { isValidEmail, isNonEmptyString, isNonNegativeNumber } = require("../utils/validation");
const { sendError } = require("../utils/errors");

const prisma = new PrismaClient();
const MIN_PASSWORD_LENGTH = 8;
const SUPPORTED_CURRENCIES = ["MGA", "EUR", "USD", "GBP"];

async function signup(req, res) {
  try {
    const { email, password, fullName } = req.body;

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Adresse email invalide" });
    }
    if (typeof password !== "string" || password.length < MIN_PASSWORD_LENGTH) {
      return res.status(400).json({
        message: `Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères`
      });
    }
    if (fullName !== undefined && fullName !== null && !isNonEmptyString(fullName)) {
      return res.status(400).json({ message: "Nom invalide" });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser)
      return res.status(400).json({ message: "Utilisateur déjà existant" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { email, password: hashedPassword, fullName },
    });

    res.status(201).json({ message: "Utilisateur créé", userId: user.id });
  } catch (err) {
    sendError(res, err, { message: "Erreur serveur lors de la création" });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!isValidEmail(email) || typeof password !== "string" || password.length === 0) {
      return res.status(400).json({ message: "Email et mot de passe requis" });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) return res.status(401).json({ message: "Utilisateur introuvable" });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ message: "Mot de passe incorrect" });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.json({ token });
  } catch (err) {
    sendError(res, err, { message: "Erreur serveur lors de la connexion" });
  }
}

async function getMe(req, res) {
  try {
    const userId = req.user.id;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });
    res.json({ email: user.email, id: user.id, budget: Number(user.budget || 0), currency: user.currency });
  } catch (err) {
    sendError(res, err);
  }
}

async function updateBudget(req, res) {
  try {
    const { budget } = req.body;
    if (!isNonNegativeNumber(budget)) {
      return res.status(400).json({ message: "Le budget doit être un nombre positif ou nul" });
    }

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { budget }
    });
    res.json({ budget: Number(user.budget || 0) });
  } catch (err) {
    sendError(res, err);
  }
}

async function updateCurrency(req, res) {
  try {
    const { currency } = req.body;
    if (!SUPPORTED_CURRENCIES.includes(currency)) {
      return res.status(400).json({ message: `La devise doit être l'une de : ${SUPPORTED_CURRENCIES.join(", ")}` });
    }

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { currency }
    });
    res.json({ currency: user.currency });
  } catch (err) {
    sendError(res, err);
  }
}

module.exports = { signup, login, getMe, updateBudget, updateCurrency, SUPPORTED_CURRENCIES };
