// app.js
require('dotenv').config();  // برای استفاده از متغیرهای محیطی
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');

const app = express();

// === ایمپورت مدل‌ها ===
const { User, Project, Task, Team, Report } = require('./models');

// === اتصال به دیتابیس با استفاده از متغیر محیطی ===
const dbURI = process.env.MONGODB_URI || 'mongodb+srv://mrsami:Admin123@cluster0.9dniolf.mongodb.net/AfgFreelance-database';

mongoose.connect(dbURI, {
    autoIndex: true,
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
})
.then(() => {
    console.log('✅ Connected to MongoDB Atlas');
    console.log(`📊 Database: ${mongoose.connection.db.databaseName}`);
})
.catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
});

// === Middlewareهای عمومی ===
app.use(helmet());  // امنیت
app.use(cors());    // مدیریت CORS
app.use(express.json());  // Parse JSON
app.use(express.urlencoded({ extended: true }));  // Parse URL-encoded
app.use(morgan('dev'));  // لاگ‌گیری
app.use(express.static(path.join(__dirname, 'public')));  // فایل‌های استاتیک

// === تنظیمات View Engine ===
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// === Import Routes ===
const indexRoutes = require('./routes/indexRoutes');
const userRoutes = require('./routes/userRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');
const teamRoutes = require('./routes/teamRoutes');

// === استفاده از Routes ===
app.use('/', indexRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/teams', teamRoutes);

// === مدیریت خطاهای 404 ===
app.use((req, res, next) => {
    res.status(404).render('404', { 
        title: 'Page Not Found' 
    });
});

// === مدیریت خطاهای سرور ===
app.use((err, req, res, next) => {
    console.error('❌ Server Error:', err.stack);
    res.status(500).render('error', { 
        title: 'Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong!'
    });
});

// === راه‌اندازی سرور ===
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// === مدیریت خاموش شدن graceful ===
process.on('SIGINT', async () => {
    console.log('🛑 Shutting down gracefully...');
    await mongoose.disconnect();
    console.log('✅ MongoDB disconnected');
    process.exit(0);
});