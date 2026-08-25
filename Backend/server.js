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
app.use('/api/incomes', require('./routes/incomeRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/summary', require('./routes/summaryRoutes'));

// 404 for anything that didn't match a route above.
app.use((req, res) => {
  res.status(404).json({ message: 'Route non trouvée' });
});

// Centralized error handler. Any route handler that calls next(err) — or any
// synchronous throw inside a route — ends up here instead of crashing the
// process or leaking a stack trace to the client.
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({ message: 'Erreur serveur interne' });
});

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
