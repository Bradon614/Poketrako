// server.js — the actual runtime entrypoint (npm start). Validates
// configuration, connects Prisma, and starts listening. Kept separate from
// app.js so tests can import the Express app without triggering any of this.
require('dotenv').config();

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

const { PrismaClient } = require('@prisma/client');
const app = require('./app');

const prisma = new PrismaClient();

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
