const rateLimit = require('express-rate-limit');

// Tests create many users in quick succession from the same IP (Supertest),
// which would otherwise trip these limits and fail unrelated tests. The
// limiter logic itself is covered by manual verification (see README).
const skipInTests = () => process.env.NODE_ENV === 'test';

// Signup: looser limit, mainly to stop scripted mass account creation.
const signupLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTests,
  message: { message: 'Trop de tentatives d\'inscription. Réessayez plus tard.' }
});

// Login: tighter limit, this is the primary brute-force / credential-stuffing target.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTests,
  message: { message: 'Trop de tentatives de connexion. Réessayez plus tard.' }
});

module.exports = { signupLimiter, loginLimiter };
