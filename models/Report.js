// models/Report.js
const mongoose = require('mongoose');
const BaseModel = require('./baseModel');

const reportSchema = new mongoose.Schema({
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
        },
        tasks: [{
            title: String,
            status: String,
            hours: Number,
            completedAt: Date
        }],
        projects: [{
            title: String,
            status: String,
            budget: Number,
            deadline: Date
        }]
    },
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
    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'draft'
    },
    tags: [{
        type: String,
        trim: true,
        lowercase: true
    }],
    summary: {
        type: String,
        maxlength: [500, 'Summary cannot exceed 500 characters']
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// اعمال مدل پایه
new BaseModel(reportSchema);

// Virtual Properties
reportSchema.virtual('duration').get(function() {
    const diff = this.period.end - this.period.start;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

// Instance Methods
reportSchema.methods.publish = function() {
    this.status = 'published';
    return this.save();
};

reportSchema.methods.archive = function() {
    this.status = 'archived';
    return this.save();
};

// Static Methods
reportSchema.statics.getReportsByUser = function(userId, type = null) {
    const query = { forUser: userId };
    if (type) query.type = type;
    
    return this.find(query)
        .populate('generatedBy', 'fullName email')
        .sort({ createdAt: -1 });
};

reportSchema.statics.getRecentReports = function(limit = 10) {
    return this.find({ status: 'published' })
        .populate('generatedBy', 'fullName email')
        .populate('forUser', 'fullName email')
        .sort({ createdAt: -1 })
        .limit(limit);
};

// ✅ ایندکس‌ها
reportSchema.index({ generatedBy: 1 });
reportSchema.index({ forUser: 1 });
reportSchema.index({ forProject: 1 });
reportSchema.index({ forTeam: 1 });
reportSchema.index({ type: 1, 'period.start': -1 });
reportSchema.index({ status: 1 });
reportSchema.index({ createdAt: -1 });

const Report = mongoose.model('Report', reportSchema);
module.exports = Report;