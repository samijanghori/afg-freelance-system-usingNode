// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { User, Project, Task, Team } = require('../models');

// ============================
// آمار کلی سیستم
// ============================
router.get('/stats', protect, authorize('admin'), async (req, res) => {
    try {
        const [
            totalUsers,
            totalProjects,
            totalTasks,
            totalTeams,
            activeUsers,
            completedProjects
        ] = await Promise.all([
            User.countDocuments({ isDeleted: false }),
            Project.countDocuments({ isDeleted: false }),
            Task.countDocuments({ isDeleted: false }),
            Team.countDocuments({ isDeleted: false }),
            User.countDocuments({ isActive: true, isDeleted: false }),
            Project.countDocuments({ status: 'completed', isDeleted: false })
        ]);

        // محاسبه درآمد کل
        const projects = await Project.find({ isDeleted: false });
        const totalEarnings = projects.reduce((sum, p) => sum + (p.budget?.amount || 0), 0);

        res.json({
            success: true,
            data: {
                totalUsers,
                activeUsers,
                totalProjects,
                completedProjects,
                totalTasks,
                totalTeams,
                totalEarnings
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ============================
// دریافت همه کاربران (ادمین)
// ============================
router.get('/users', protect, authorize('admin'), async (req, res) => {
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

// ============================
// دریافت فعالیت‌های اخیر
// ============================
router.get('/recent-activity', protect, authorize('admin'), async (req, res) => {
    try {
        const [recentUsers, recentProjects, recentTasks] = await Promise.all([
            User.find().sort({ createdAt: -1 }).limit(5).select('fullName email createdAt'),
            Project.find().sort({ createdAt: -1 }).limit(5).select('title client status createdAt'),
            Task.find().sort({ createdAt: -1 }).limit(5).select('title project status createdAt')
        ]);

        res.json({
            success: true,
            data: {
                recentUsers,
                recentProjects,
                recentTasks
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ============================
// دریافت آمار پروژه‌ها بر اساس وضعیت
// ============================
router.get('/project-status', protect, authorize('admin'), async (req, res) => {
    try {
        const stats = await Project.aggregate([
            { $match: { isDeleted: false } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalBudget: { $sum: '$budget.amount' }
                }
            }
        ]);

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;