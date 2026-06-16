// routes/projectRoutes.js
const express = require('express');
const router = express.Router();
const { Project, Task } = require('../models');

// === GET: دریافت همه پروژه‌ها ===
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

// === GET: دریافت پروژه با ID ===
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

// === POST: ایجاد پروژه جدید ===
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

// === PUT: بروزرسانی پروژه ===
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

// === DELETE: حذف پروژه ===
router.delete('/:id', async (req, res) => {
    try {
        const project = await Project.findByIdAndDelete(req.params.id);
        
        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }
        
        // حذف تمام وظایف مرتبط با پروژه
        await Task.deleteMany({ project: req.params.id });
        
        res.json({
            success: true,
            message: 'Project deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// === GET: دریافت وظایف یک پروژه ===
router.get('/:id/tasks', async (req, res) => {
    try {
        const tasks = await Task.getTasksByProject(req.params.id);
        
        res.json({
            success: true,
            count: tasks.length,
            data: tasks
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// === PUT: بروزرسانی پیشرفت پروژه ===
router.put('/:id/progress', async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        
        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }
        
        await project.updateProgress();
        
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

// === GET: دریافت پروژه‌های معوق ===
router.get('/overdue', async (req, res) => {
    try {
        const projects = await Project.getOverdueProjects()
            .populate('client', 'fullName email');
        
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

module.exports = router;