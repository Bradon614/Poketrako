// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

// Fail fast on missing configuration rather than crashing later on the first
// request that happens to need it.
const REQUIRED_ENV = ['DATABASE_URL', 'JWT_SECRET'];
const missingEnv = REQUIRED_ENV.filter((key) => !process.env[key]);
if (missingEnv.length > 0) {
  console.error(
    `Missing required environment variable(s): ${missingEnv.join(', ')}.\n` +
      'Copy Backend/.env.example to Backend/.env and fill in the values.'
  );
  process.exit(1);
}

const prisma = new PrismaClient();
const app = express();

app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/expenses', require('./routes/expenseRoutes'));

async function startServer() {
  try {
    await prisma.$connect();
    console.log('Prisma connected to PostgreSQL');

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
  } catch (err) {
    console.error('Prisma connection error:', err);
    process.exit(1);
  }
}

startServer();
