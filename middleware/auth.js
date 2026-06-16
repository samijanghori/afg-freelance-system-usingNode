// middleware/auth.js
// توجه: این فایل فعلاً غیرفعال است تا خطا ندهد
// برای استفاده بعدی نگهداری می‌شود

/*
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const protect = async (req, res, next) => {
    // ... کد احراز هویت
};

module.exports = { protect };
*/

// فعلاً یک middleware خالی برای جلوگیری از خطا
const protect = (req, res, next) => next();
const authorize = (...roles) => (req, res, next) => next();
const checkPermission = (permissions) => (req, res, next) => next();

module.exports = { protect, authorize, checkPermission };