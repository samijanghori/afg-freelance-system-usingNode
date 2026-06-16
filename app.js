// app.js (نسخه ساده شده برای تست)
require('dotenv').config();

const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');


const app = express();

// اتصال به دیتابیس
const dbURI = process.env.MONGODB_URI || 'mongodb+srv://mrsami:Admin123@cluster0.9dniolf.mongodb.net/AfgFreelance-database';

mongoose.connect(dbURI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch((err) => console.error('❌ MongoDB Error:', err.message));

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);


// تنظیمات View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// === بارگذاری Routes با try/catch ===
let indexRoutes, userRoutes, projectRoutes, taskRoutes, teamRoutes;

try {
    indexRoutes = require('./routes/indexRoutes');
    console.log('✅ indexRoutes loaded');
} catch (err) {
    console.error('❌ Error loading indexRoutes:', err.message);
    indexRoutes = (req, res) => res.status(500).send('indexRoutes error');
}

try {
    userRoutes = require('./routes/userRoutes');
    console.log('✅ userRoutes loaded');
} catch (err) {
    console.error('❌ Error loading userRoutes:', err.message);
    userRoutes = (req, res) => res.status(500).send('userRoutes error');
}

try {
    projectRoutes = require('./routes/projectRoutes');
    console.log('✅ projectRoutes loaded');
} catch (err) {
    console.error('❌ Error loading projectRoutes:', err.message);
    projectRoutes = (req, res) => res.status(500).send('projectRoutes error');
}

try {
    taskRoutes = require('./routes/taskRoutes');
    console.log('✅ taskRoutes loaded');
} catch (err) {
    console.error('❌ Error loading taskRoutes:', err.message);
    taskRoutes = (req, res) => res.status(500).send('taskRoutes error');
}

try {
    teamRoutes = require('./routes/teamRoutes');
    console.log('✅ teamRoutes loaded');
} catch (err) {
    console.error('❌ Error loading teamRoutes:', err.message);
    teamRoutes = (req, res) => res.status(500).send('teamRoutes error');
}

// === استفاده از Routes ===
app.use('/', indexRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/teams', teamRoutes);

// مدیریت خطاهای 404
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// مدیریت خطاهای سرور
app.use((err, req, res, next) => {
    console.error('❌ Server Error:', err.stack);
    res.status(500).json({
        success: false,
        message: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
    });
});

// راه‌اندازی سرور
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});