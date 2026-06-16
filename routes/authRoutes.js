// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    register,
    login,
    getMe,
    logout
} = require('../controllers/authController');

// ============================
// مسیرهای عمومی
// ============================
router.post('/register', register);
router.post('/login', login);

// ============================
// مسیرهای محافظت شده
// ============================
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

module.exports = router;