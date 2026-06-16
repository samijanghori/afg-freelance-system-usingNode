// routes/projectRoutes.js
const express = require('express');
const router = express.Router();
const { Project, Task } = require('../models');

// GET: دریافت همه پروژه‌ها
router.get('/', async (req, res) => {
    try {
        const projects = await Project.find()
            .populate('client', 'fullName email')
            .populate('projectManager', 'fullName email')
            .populate('team.member', 'fullName email')
            .sort({ createdAt: -1 });
        
        res.json({
            success: true,
            count: projects.length,
            data: projects
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// GET: دریافت پروژه با ID
router.get('/:id', async (req, res) => {
    try {
        const project = await Project.findById(req.params.id)
            .populate('client', 'fullName email')
            .populate('projectManager', 'fullName email')
            .populate('team.member', 'fullName email');
        
        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }
        
        res.json({
            success: true,
            data: project
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// POST: ایجاد پروژه جدید
router.post('/', async (req, res) => {
    try {
        const project = new Project(req.body);
        await project.save();
        
        res.status(201).json({
            success: true,
            data: project
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// PUT: بروزرسانی پروژه
router.put('/:id', async (req, res) => {
    try {
        const project = await Project.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        ).populate('client', 'fullName email')
         .populate('projectManager', 'fullName email');
        
        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }
        
        res.json({
            success: true,
            data: project
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;  // ✅ مهم: صادر کردن router