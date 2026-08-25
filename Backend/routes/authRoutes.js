const express = require("express");
const router = express.Router();
const { signup, login, getMe } = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const { signupLimiter, loginLimiter } = require("../middleware/rateLimiters");

router.post("/signup", signupLimiter, signup);
router.post("/login", loginLimiter, login);
router.get("/me", authMiddleware, getMe);

module.exports = router;
