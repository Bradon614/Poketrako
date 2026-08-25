const rateLimit = require('express-rate-limit');

// Signup: looser limit, mainly to stop scripted mass account creation.
const signupLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Trop de tentatives d\'inscription. Réessayez plus tard.' }
});

// Login: tighter limit, this is the primary brute-force / credential-stuffing target.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Trop de tentatives de connexion. Réessayez plus tard.' }
});

module.exports = { signupLimiter, loginLimiter };
