// app.js
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const morgan = require('morgan');

// === بارگذاری متغیرهای محیطی از فایل .env (اگر وجود داشته باشد) ===
try {
    require('dotenv').config();
    console.log('✅ .env file loaded successfully');
} catch (error) {
    console.log('ℹ️ No .env file found, using default values');
}

// === اتصال به دیتابیس ===
const dbURI = process.env.MONGODB_URI || 'mongodb+srv://mrsami:Admin123@cluster0.9dniolf.mongodb.net/AfgFreelance-database';

mongoose.connect(dbURI)
    .then(() => {
        console.log('✅ Connected to MongoDB Atlas');
        console.log(`📊 Database: ${mongoose.connection.db.databaseName}`);
    })
    .catch((err) => {
        console.error('❌ MongoDB connection error:', err.message);
    });

// === تنظیمات View Engine ===
app.set('view engine', 'ejs');
app.use(morgan('dev'));
app.use(express.static('public'));

// === مسیرها ===
app.get('/', (req, res) => {
    const members = [
        // ... داده‌های members
    ];
    res.render('index', { title: 'HomePage', members: members });
});

app.get('/about', (req, res) => {
    res.render('about', { title: 'OurTeam' });
});

app.get('/create/member', (req, res) => {
    res.render('create_member', { title: 'CreateMember' });
});

// === راه‌اندازی سرور ===
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});