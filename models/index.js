// models/index.js
const mongoose = require('mongoose');
const User = require('./User');
const Project = require('./Project');
const Task = require('./Task');
const Team = require('./Team');
const Report = require('./Report');

// صادر کردن همه مدل‌ها
module.exports = {
    User,
    Project,
    Task,
    Team,
    Report,
    // متد کمکی برای اتصال به دیتابیس
    connectDB: async (uri) => {
        try {
            const conn = await mongoose.connect(uri, {
                autoIndex: true,
                maxPoolSize: 10,
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
            });
            console.log(`MongoDB Connected: ${conn.connection.host}`);
            return conn;
        } catch (error) {
            console.error('MongoDB connection error:', error);
            process.exit(1);
        }
    },
    // متد کمکی برای بستن اتصال
    disconnectDB: async () => {
        await mongoose.disconnect();
        console.log('MongoDB disconnected');
    }
};