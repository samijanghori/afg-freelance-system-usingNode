// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { User } = require('../models');
const { validateEmail, validatePhoneNumber } = require('../models/helpers/validators');

// === GET: دریافت همه کاربران ===
router.get('/', async (req, res) => {
    try {
        const users = await User.find()
            .select('-password -refreshToken -__v')
            .sort({ createdAt: -1 });
        
        res.json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// === GET: دریافت کاربر با ID ===
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('-password -refreshToken -__v');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// === POST: ایجاد کاربر جدید ===
router.post('/', async (req, res) => {
    try {
        // اعتبارسنجی ایمیل
        if (req.body.email && !validateEmail(req.body.email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email format'
            });
        }
        
        // اعتبارسنجی شماره تلفن
        if (req.body.phoneNumber && !validatePhoneNumber(req.body.phoneNumber)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid phone number format'
            });
        }
        
        const user = new User(req.body);
        await user.save();
        
        res.status(201).json({
            success: true,
            data: user.getPublicProfile()
        });
    } catch (error) {
        // خطای تکراری بودن ایمیل
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Email already exists'
            });
        }
        
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// === PUT: بروزرسانی کاربر ===
router.put('/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        ).select('-password -refreshToken -__v');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// === DELETE: حذف کاربر (Soft Delete) ===
router.delete('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        await user.softDelete(req.user?._id || null);
        
        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// === GET: دریافت فریلنسرهای فعال ===
router.get('/freelancers/active', async (req, res) => {
    try {
        const freelancers = await User.findActiveFreelancers();
        
        res.json({
            success: true,
            count: freelancers.length,
            data: freelancers
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// === GET: دریافت برترین فریلنسرها ===
router.get('/freelancers/top', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const topFreelancers = await User.getTopRated(limit);
        
        res.json({
            success: true,
            count: topFreelancers.length,
            data: topFreelancers
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;