// controllers/authController.js
const jwt = require('jsonwebtoken');
const { User } = require('../models');

// ============================
// توابع کمکی
// ============================

// تولید توکن
const generateToken = (id, role) => {
    return jwt.sign(
        { id, role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
};

// ============================
// ثبت‌نام کاربر جدید
// ============================
exports.register = async (req, res) => {
    try {
        const { fullName, email, password, phoneNumber, profession, province } = req.body;

        // بررسی اینکه کاربر وجود دارد
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered'
            });
        }

        // ایجاد کاربر جدید
        const user = new User({
            fullName,
            email,
            password,
            phoneNumber,
            profession,
            province
        });

        await user.save();

        // تولید توکن
        const token = generateToken(user._id, user.role);

        res.status(201).json({
            success: true,
            token,
            data: user.getPublicProfile()
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// ============================
// ورود کاربر
// ============================
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // یافتن کاربر
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // بررسی رمز عبور
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // بروزرسانی آخرین ورود
        user.lastLogin = new Date();
        await user.save();

        // تولید توکن
        const token = generateToken(user._id, user.role);

        res.json({
            success: true,
            token,
            data: user.getPublicProfile()
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// ============================
// دریافت اطلاعات کاربر جاری
// ============================
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.json({
            success: true,
            data: user.getPublicProfile()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ============================
// خروج کاربر
// ============================
exports.logout = (req, res) => {
    res.json({
        success: true,
        message: 'Logged out successfully'
    });
};