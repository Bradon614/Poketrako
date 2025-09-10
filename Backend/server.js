// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();

app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/expenses', require('./routes/expenseRoutes'));

async function startServer() {
  try {
    await prisma.$connect();
    console.log('✅ Connexion Prisma à PostgreSQL réussie !');

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Serveur lancé sur le port ${PORT}`));
  } catch (err) {
    console.error('❌ Erreur connexion Prisma:', err);
    process.exit(1);
  }
}

startServer();

