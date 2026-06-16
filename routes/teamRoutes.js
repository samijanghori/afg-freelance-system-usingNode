// routes/teamRoutes.js
const express = require('express');
const router = express.Router();
const { Team } = require('../models');

// GET: دریافت همه تیم‌ها
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

// GET: دریافت تیم با ID
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

// POST: ایجاد تیم جدید
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

module.exports = router;  // ✅ مهم: صادر کردن router