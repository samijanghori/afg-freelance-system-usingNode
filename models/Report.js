// models/Report.js
const mongoose = require('mongoose');
const BaseModel = require('./baseModel');

const reportSchema = new mongoose.Schema({
    // === اطلاعات اصلی ===
    title: {
        type: String,
        required: [true, 'Report title is required'],
        trim: true
    },
    type: {
        type: String,
        enum: ['daily', 'weekly', 'monthly', 'project', 'performance', 'financial'],
        required: true
    },
    
    // === تولیدکننده و گیرنده ===
    generatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    forUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    forProject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project'
    },
    forTeam: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team'
    },
    
    // === داده‌های گزارش ===
    data: {
        tasksCompleted: {
            type: Number,
            default: 0
        },
        hoursWorked: {
            type: Number,
            default: 0,
            min: 0
        },
        projectsDelivered: {
            type: Number,
            default: 0
        },
        earnings: {
            type: Number,
            default: 0,
            min: 0
        },
        rating: {
            type: Number,
            min: 0,
            max: 5
        },
        details: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
        }
    },
    
    // === دوره زمانی ===
    period: {
        start: {
            type: Date,
            required: true
        },
        end: {
            type: Date,
            required: true
        }
    },
    
    // === متادیتا ===
    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'draft'
    },
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

// === اعمال مدل پایه ===
new BaseModel(reportSchema);

// === Virtual Properties ===
reportSchema.virtual('duration').get(function() {
    const diff = this.period.end - this.period.start;
    return Math.ceil(diff / (1000 * 60 * 60 * 24)); // روزها
});

// === Instance Methods ===
reportSchema.methods.publish = function() {
    this.status = 'published';
    return this.save();
};

reportSchema.methods.archive = function() {
    this.status = 'archived';
    return this.save();
};

// === Static Methods ===
reportSchema.statics.generateMonthlyReport = async function(userId, month, year) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    const Task = mongoose.model('Task');
    const Project = mongoose.model('Project');
    
    const tasks = await Task.find({
        assignedTo: userId,
        completedDate: { $gte: startDate, $lte: endDate }
    });
    
    const projects = await Project.find({
        'team.member': userId,
        endDate: { $gte: startDate, $lte: endDate }
    });
    
    return {
        tasksCompleted: tasks.filter(t => t.status === 'done').length,
        hoursWorked: tasks.reduce((sum, t) => sum + (t.actualHours || 0), 0),
        projectsDelivered: projects.filter(p => p.status === 'completed').length,
        details: {
            tasks: tasks.map(t => ({
                title: t.title,
                hours: t.actualHours,
                status: t.status
            })),
            projects: projects.map(p => ({
                title: p.title,
                status: p.status,
                budget: p.budget
            }))
        }
    };
};

reportSchema.statics.getReportsByUser = function(userId, type = null) {
    const query = { forUser: userId };
    if (type) query.type = type;
    
    return this.find(query)
        .populate('generatedBy', 'fullName email')
        .sort({ createdAt: -1 });
};

reportSchema.statics.getProjectPerformance = function(projectId) {
    return this.find({
        forProject: projectId,
        type: 'project'
    }).populate('generatedBy', 'fullName');
};

// === Indexes ===
reportSchema.index({ generatedBy: 1 });
reportSchema.index({ forUser: 1 });
reportSchema.index({ forProject: 1 });
reportSchema.index({ type: 1, 'period.start': -1 });
reportSchema.index({ status: 1 });

const Report = mongoose.model('Report', reportSchema);
module.exports = Report;