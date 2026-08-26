// app.js — builds the Express app with no side effects (no listening, no DB
// connection). Kept separate from server.js so tests can import it directly
// with Supertest instead of spinning up a real HTTP server.
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();

// Render (and most PaaS hosts) sit the app behind a reverse proxy, which
// sets X-Forwarded-For. Without this, express-rate-limit either throws a
// validation error or rate-limits every visitor as if they shared the
// proxy's IP. `1` trusts exactly one hop, matching Render's setup.
if (process.env.TRUST_PROXY) {
  app.set('trust proxy', 1);
}

// The API and the frontend are served from different origins, so uploaded
// files must stay loadable cross-origin (e.g. an <img> on the frontend
// pointing at /uploads/...).
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
app.use(cors({ origin: FRONTEND_URL }));

app.use(express.json());
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

module.exports = app;
