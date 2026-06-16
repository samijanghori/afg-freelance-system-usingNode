// routes/taskRoutes.js
const express = require('express');
const router = express.Router();
const { Task } = require('../models');

// === GET: دریافت همه وظایف ===
router.get('/', async (req, res) => {
    try {
        const tasks = await Task.find()
            .populate('assignedTo', 'fullName email')
            .populate('assignedBy', 'fullName email')
            .populate('project', 'title')
            .sort({ createdAt: -1 });
        
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

// === GET: دریافت وظیفه با ID ===
router.get('/:id', async (req, res) => {
    try {
        const task = await Task.findById(req.params.id)
            .populate('assignedTo', 'fullName email')
            .populate('assignedBy', 'fullName email')
            .populate('project', 'title');
        
        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }
        
        res.json({
            success: true,
            data: task
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// === POST: ایجاد وظیفه جدید ===
router.post('/', async (req, res) => {
    try {
        const task = new Task(req.body);
        await task.save();
        
        res.status(201).json({
            success: true,
            data: task
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// === PUT: بروزرسانی وظیفه ===
router.put('/:id', async (req, res) => {
    try {
        const task = await Task.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        ).populate('assignedTo', 'fullName email');
        
        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }
        
        res.json({
            success: true,
            data: task
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// === DELETE: حذف وظیفه ===
router.delete('/:id', async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id);
        
        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Task deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// === PUT: تغییر وضعیت وظیفه ===
router.put('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        
        if (!status) {
            return res.status(400).json({
                success: false,
                message: 'Status is required'
            });
        }
        
        const task = await Task.findByIdAndUpdate(
            req.params.id,
            { status },
            {
                new: true,
                runValidators: true
            }
        ).populate('assignedTo', 'fullName email');
        
        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }
        
        // اگر وظیفه کامل شد، پیشرفت پروژه را بروزرسانی کن
        if (status === 'done') {
            const Project = require('../models').Project;
            const project = await Project.findById(task.project);
            if (project) {
                await project.updateProgress();
            }
        }
        
        res.json({
            success: true,
            data: task
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// === GET: دریافت وظایف معوق ===
router.get('/overdue', async (req, res) => {
    try {
        const tasks = await Task.getOverdueTasks();
        
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

// === GET: دریافت وظایف یک کاربر ===
router.get('/user/:userId', async (req, res) => {
    try {
        const tasks = await Task.getTasksByUser(req.params.userId);
        
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

module.exports = router;