// routes/taskRoutes.js
const express = require('express');
const router = express.Router();
const { Task, Project } = require('../models');

// GET: دریافت همه وظایف
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

// GET: دریافت وظیفه با ID
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

// POST: ایجاد وظیفه جدید
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

module.exports = router;  // ✅ مهم: صادر کردن router