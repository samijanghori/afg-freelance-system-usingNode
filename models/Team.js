// models/Team.js
const mongoose = require('mongoose');
const BaseModel = require('./baseModel');

const teamSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Team name is required'],
        unique: true,  // ✅ ایندکس یکبار تعریف شده
        trim: true,
        maxlength: [50, 'Team name cannot exceed 50 characters']
    },
    description: {
        type: String,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    leader: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Team leader is required']
    },
    members: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        role: {
            type: String,
            enum: ['leader', 'senior', 'junior', 'intern']
        },
        joinedDate: {
            type: Date,
            default: Date.now
        },
        isActive: {
            type: Boolean,
            default: true
        },
        tasksCompleted: {
            type: Number,
            default: 0
        }
    }],
    currentProjects: [{
        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project'
        },
        assignedDate: {
            type: Date,
            default: Date.now
        },
        isActive: {
            type: Boolean,
            default: true
        }
    }],
    stats: {
        totalProjects: {
            type: Number,
            default: 0
        },
        completedProjects: {
            type: Number,
            default: 0
        },
        averageRating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
        totalEarnings: {
            type: Number,
            default: 0
        },
        totalTasksCompleted: {
            type: Number,
            default: 0
        }
    },
    tags: [{
        type: String,
        trim: true,
        lowercase: true
    }],
    location: {
        type: String,
        enum: ['Kabul', 'Herat', 'Mazar-e-Sharif', 'Kandahar', 'Balkh', 'Nangarhar', 'Online'],
        default: 'Online'
    },
    availableForWork: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// اعمال مدل پایه
new BaseModel(teamSchema);

// Virtual Properties
teamSchema.virtual('memberCount').get(function() {
    return this.members.filter(m => m.isActive).length;
});

teamSchema.virtual('activeProjectCount').get(function() {
    return this.currentProjects.filter(p => p.isActive).length;
});

// Instance Methods
teamSchema.methods.addMember = function(userId, role) {
    if (this.members.some(m => m.user.toString() === userId.toString() && m.isActive)) {
        throw new Error('User is already an active member of this team');
    }
    this.members.push({ user: userId, role });
    return this.save();
};

teamSchema.methods.removeMember = function(userId) {
    const member = this.members.find(m => m.user.toString() === userId.toString());
    if (!member) {
        throw new Error('User is not a member of this team');
    }
    member.isActive = false;
    return this.save();
};

teamSchema.methods.addProject = function(projectId) {
    if (this.currentProjects.some(p => p.project.toString() === projectId.toString() && p.isActive)) {
        throw new Error('Project is already assigned to this team');
    }
    this.currentProjects.push({ project: projectId });
    this.stats.totalProjects += 1;
    return this.save();
};

// Static Methods
teamSchema.statics.getTeamWithMembers = function(teamId) {
    return this.findById(teamId)
        .populate('leader', 'fullName email profileImage')
        .populate('members.user', 'fullName email profession skills profileImage');
};

teamSchema.statics.getTeamsByLeader = function(leaderId) {
    return this.find({ leader: leaderId })
        .populate('members.user', 'fullName email')
        .populate('currentProjects.project', 'title');
};

teamSchema.statics.getTopTeams = function(limit = 5) {
    return this.find({ isDeleted: false })
        .sort({ 'stats.averageRating': -1, 'stats.completedProjects': -1 })
        .limit(limit)
        .populate('leader', 'fullName');
};

// ✅ فقط ایندکس‌های غیرتکراری
teamSchema.index({ leader: 1 });
teamSchema.index({ 'members.user': 1 });
teamSchema.index({ 'stats.averageRating': -1 });
teamSchema.index({ location: 1 });

const Team = mongoose.model('Team', teamSchema);
module.exports = Team;