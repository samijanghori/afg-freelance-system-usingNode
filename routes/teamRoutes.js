// routes/teamRoutes.js
const express = require('express');
const router = express.Router();
const { Team } = require('../models');

// === GET: دریافت همه تیم‌ها ===
router.get('/', async (req, res) => {
    try {
        const teams = await Team.find()
            .populate('leader', 'fullName email')
            .populate('members.user', 'fullName email')
            .sort({ createdAt: -1 });
        
        res.json({
            success: true,
            count: teams.length,
            data: teams
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// === GET: دریافت تیم با ID ===
router.get('/:id', async (req, res) => {
    try {
        const team = await Team.getTeamWithMembers(req.params.id);
        
        if (!team) {
            return res.status(404).json({
                success: false,
                message: 'Team not found'
            });
        }
        
        res.json({
            success: true,
            data: team
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// === POST: ایجاد تیم جدید ===
router.post('/', async (req, res) => {
    try {
        const team = new Team(req.body);
        await team.save();
        
        res.status(201).json({
            success: true,
            data: team
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// === PUT: بروزرسانی تیم ===
router.put('/:id', async (req, res) => {
    try {
        const team = await Team.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        ).populate('leader', 'fullName email')
         .populate('members.user', 'fullName email');
        
        if (!team) {
            return res.status(404).json({
                success: false,
                message: 'Team not found'
            });
        }
        
        res.json({
            success: true,
            data: team
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// === DELETE: حذف تیم ===
router.delete('/:id', async (req, res) => {
    try {
        const team = await Team.findByIdAndDelete(req.params.id);
        
        if (!team) {
            return res.status(404).json({
                success: false,
                message: 'Team not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Team deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// === POST: اضافه کردن عضو به تیم ===
router.post('/:id/members', async (req, res) => {
    try {
        const { userId, role } = req.body;
        
        if (!userId || !role) {
            return res.status(400).json({
                success: false,
                message: 'userId and role are required'
            });
        }
        
        const team = await Team.findById(req.params.id);
        
        if (!team) {
            return res.status(404).json({
                success: false,
                message: 'Team not found'
            });
        }
        
        await team.addMember(userId, role);
        
        res.json({
            success: true,
            data: team
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// === DELETE: حذف عضو از تیم ===
router.delete('/:id/members/:userId', async (req, res) => {
    try {
        const team = await Team.findById(req.params.id);
        
        if (!team) {
            return res.status(404).json({
                success: false,
                message: 'Team not found'
            });
        }
        
        await team.removeMember(req.params.userId);
        
        res.json({
            success: true,
            data: team
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;