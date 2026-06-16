const mongoose = require('mongoose');
const Schema = mongoose.Schema;  

const userSchema = new Schema({
    fullname: {
        type: String,
        required: [true, 'Full name is required']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required']
    },
    phoneNumber: {
        type: String,
        required: true
    },
    province: {
        type: String,
        enum: ['kabul', 'herat', 'mazar-e-sharif', 'balkh', 'ghor', 'nangarhar', 'sarpol', 'jawzjan', 'other'],
        default: 'other'
    },
    profileImage: {  
        type: String,
        default: 'default.jpg'
    },
    profession: {
        type: String,
        enum: ['Web Developer', 'Graphic Designer', 'Mobile Developer', 'Translator', 'UI/UX', 'Video Editor', 'Other'],
        default: 'Other'
    },
    skills: [{
        type: String
    }],
    experience: {
        type: Number,
        min: 0,
        max: 50
    },
    portfolio: [{
        title: String,
        description: String,
        link: String,
        image: String
    }],
    role: {
        type: String,
        enum: ['admin', 'project_manager', 'team_leader', 'freelancer', 'client'],
        default: 'freelancer'
    },
    permissions: [{
        type: String,
        enum: ['manage_users', 'manage_projects', 'manage_tasks', 'view_reports', 'manage_team']
    }],
    status: {
        type: String,
        enum: ['available', 'busy', 'offline', 'on_leave'],
        default: 'available'
    },
    rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
    },
    totalProjects: {
        type: Number,
        default: 0
    },
    completedProjects: {
        type: Number,
        default: 0
    },
    lastLogin: Date,
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true  // 
});

const User = mongoose.model('User', userSchema);
module.exports = User;