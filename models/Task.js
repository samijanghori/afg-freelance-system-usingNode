// models/Task.js
const mongoose = require('mongoose');
const BaseModel = require('./baseModel');
const { TASK_STATUS, PRIORITY } = require('./helpers/constants');
const { validateURL } = require('./helpers/validators');

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Task title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
        type: String,
        maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: [true, 'Project reference is required']
    },
    assignedTo: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    assignedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    priority: {
        type: String,
        enum: Object.values(PRIORITY),
        default: PRIORITY.MEDIUM
    },
    status: {
        type: String,
        enum: Object.values(TASK_STATUS),
        default: TASK_STATUS.TODO
    },
    dueDate: {
        type: Date,
        required: [true, 'Due date is required']
    },
    startDate: Date,
    completedDate: Date,
    estimatedHours: {
        type: Number,
        min: [0.5, 'Estimated hours must be at least 0.5']
    },
    actualHours: {
        type: Number,
        default: 0
    },
    subtasks: [{
        title: {
            type: String,
            required: true,
            trim: true
        },
        isCompleted: {
            type: Boolean,
            default: false
        },
        completedAt: Date,
        completedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    }],
    dependencies: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task'
    }],
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
        size: Number,
        type: String,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
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
new BaseModel(taskSchema);

// Virtual Properties
taskSchema.virtual('isOverdue').get(function() {
    return this.status !== 'done' && 
           this.status !== 'blocked' && 
           this.dueDate < new Date();
});

taskSchema.virtual('progress').get(function() {
    const total = this.subtasks.length;
    if (total === 0) return this.status === 'done' ? 100 : 0;
    const completed = this.subtasks.filter(s => s.isCompleted).length;
    return Math.round((completed / total) * 100);
});

// Middleware
taskSchema.pre('save', function(next) {
    if (this.isModified('status') && this.status === 'done') {
        this.completedDate = new Date();
    }
    next();
});

// Instance Methods
taskSchema.methods.toggleSubtask = async function(subtaskIndex, userId) {
    if (!this.subtasks[subtaskIndex]) {
        throw new Error('Subtask not found');
    }
    
    this.subtasks[subtaskIndex].isCompleted = !this.subtasks[subtaskIndex].isCompleted;
    if (this.subtasks[subtaskIndex].isCompleted) {
        this.subtasks[subtaskIndex].completedAt = new Date();
        this.subtasks[subtaskIndex].completedBy = userId;
    }
    
    const allCompleted = this.subtasks.every(s => s.isCompleted);
    if (allCompleted && this.subtasks.length > 0) {
        this.status = 'done';
        this.completedDate = new Date();
    }
    
    return this.save();
};

// Static Methods
taskSchema.statics.getTasksByProject = function(projectId) {
    return this.find({ project: projectId })
        .populate('assignedTo', 'fullName email profileImage')
        .populate('assignedBy', 'fullName email')
        .sort({ priority: -1, dueDate: 1 });
};

taskSchema.statics.getTasksByUser = function(userId) {
    return this.find({ assignedTo: userId })
        .populate('project', 'title')
        .sort({ dueDate: 1 });
};

taskSchema.statics.getOverdueTasks = function() {
    return this.find({
        status: { $nin: ['done', 'blocked'] },
        dueDate: { $lt: new Date() }
    }).populate('project', 'title')
      .populate('assignedTo', 'fullName email');
};

// ✅ ایندکس‌های غیرتکراری
taskSchema.index({ project: 1, status: 1 });
taskSchema.index({ assignedTo: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ priority: -1 });
taskSchema.index({ title: 'text', description: 'text' });

const Task = mongoose.model('Task', taskSchema);
module.exports = Task;