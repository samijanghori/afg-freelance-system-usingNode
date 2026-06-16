const mongoose = require('mongoose');
const { Profiler } = require('react');

const schema = mongoose.schema;

const userSchema = new schema({
    fullname:{
        type: String,
        required : [true,'the full name is required']
    },
    email : {
        type: String ,
        required:[true,'email is required'], 
        unique : true,
        lowercase:true
    },
    password : {
        type: String,
        required : [true, ' password is required']
    },
    phoneNumber : {
        type : String,
        required : true
    },
    province : {
        type : String,
        enum : ['kabul' , 'herat', ' mazarei-sharif','balkh','ghor','nangarhar','sarpol','jawzjan','other'],
        default : 'other'
    },
    ProfileImage : {
        type : String,
        default : 'default.jpg'
    },
    profession :{
        type : String,
        enum : ['Web Developer','Graphic Designer','mobile developer','translator','UI / UX', 'Video Editor', ' other'],
        default:'other'
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
    
    // نقش و دسترسی
    role: {
        type: String,
        enum: ['admin', 'project_manager', 'team_leader', 'freelancer', 'client'],
        default: 'freelancer'
    },
    permissions: [{
        type: String,
        enum: ['manage_users', 'manage_projects', 'manage_tasks', 'view_reports', 'manage_team']
    }],
    
    // وضعیت
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
    
    // اطلاعات سیستمی
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastLogin: Date,
    isActive: {
        type: Boolean,
        default: true
    }

},{ 
    timestamps : true
 });