// models/Project.js
const mongoose = require('mongoose');
const BaseModel = require('./baseModel');
const {
    PROJECT_STATUS,
    PRIORITY,
    PROJECT_CATEGORIES
} = require('./helpers/constants');
const { validateURL } = require('./helpers/validators');

const projectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Project title is required'],
        trim: true,
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Project description is required'],
        maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Client is required']
    },
    projectManager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    team: [{
        member: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        role: {
            type: String,
            enum: ['lead', 'senior', 'junior', 'intern']
        },
        assignedDate: {
            type: Date,
            default: Date.now
        },
        hoursWorked: {
            type: Number,
            default: 0
        },
        isActive: {
            type: Boolean,
            default: true
        }
    }],
    category: {
        type: String,
        enum: Object.values(PROJECT_CATEGORIES),
        required: true,
        default: PROJECT_CATEGORIES.OTHER
    },
    priority: {
        type: String,
        enum: Object.values(PRIORITY),
        default: PRIORITY.MEDIUM
    },
    budget: {
        amount: {
            type: Number,
            required: [true, 'Budget amount is required'],
            min: [0, 'Budget cannot be negative']
        },
        currency: {
            type: String,
            enum: ['AFN', 'USD', 'EUR'],
            default: 'AFN'
        }
    },
    estimatedHours: {
        type: Number,
        min: [1, 'Estimated hours must be at least 1']
    },
    actualHours: {
        type: Number,
        default: 0
    },
    deadline: {
        type: Date,
        required: [true, 'Project deadline is required']
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    endDate: Date,
    status: {
        type: String,
        enum: Object.values(PROJECT_STATUS),
        default: PROJECT_STATUS.PENDING
    },
    progress: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    attachments: [{
        name: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true,
            validate: {
                validator: validateURL,
                message: 'Invalid attachment URL'
            }
        },
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        uploadedAt: {
            type: Date,
            default: Date.now
        },
        size: Number,
        type: String
    }],
    comments: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        text: {
            type: String,
            required: true,
            maxlength: [500, 'Comment cannot exceed 500 characters']
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        isEdited: {
            type: Boolean,
            default: false
        }
    }],
    tags: [{
        type: String,
        trim: true,
        lowercase: true
    }]
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// اعمال مدل پایه
new BaseModel(projectSchema);

// Virtual Properties
projectSchema.virtual('totalTeamMembers').get(function() {
    return this.team.filter(m => m.isActive).length;
});

projectSchema.virtual('isOverdue').get(function() {
    return this.status !== 'completed' && 
           this.status !== 'cancelled' && 
           this.deadline < new Date();
});

// Instance Methods
projectSchema.methods.updateProgress = async function() {
    const Task = mongoose.model('Task');
    const tasks = await Task.find({ project: this._id });
    
    const completed = tasks.filter(t => t.status === 'done').length;
    const total = tasks.length;
    
    this.progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    if (this.progress === 100 && this.status !== 'completed') {
        this.status = 'completed';
        this.endDate = new Date();
    }
    
    return this.save();
};

projectSchema.methods.addTeamMember = function(userId, role) {
    if (this.team.some(m => m.member.toString() === userId.toString() && m.isActive)) {
        throw new Error('User is already an active team member');
    }
    this.team.push({ member: userId, role });
    return this.save();
};

// Static Methods
projectSchema.statics.getActiveProjects = function() {
    return this.find({
        status: { $in: ['pending', 'in_progress', 'review'] }
    }).populate('client', 'fullName email');
};

projectSchema.statics.getOverdueProjects = function() {
    return this.find({
        status: { $nin: ['completed', 'cancelled'] },
        deadline: { $lt: new Date() }
    });
};

// ✅ ایندکس‌های غیرتکراری
projectSchema.index({ client: 1 });
projectSchema.index({ projectManager: 1 });
projectSchema.index({ status: 1, priority: 1 });
projectSchema.index({ deadline: 1 });
projectSchema.index({ 'team.member': 1 });
projectSchema.index({ title: 'text', description: 'text' });

const Project = mongoose.model('Project', projectSchema);
module.exports = Project;