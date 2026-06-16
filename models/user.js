// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const BaseModel = require('./baseModel');
const {
    PROVINCES,
    USER_ROLES,
    PERMISSIONS,
    USER_STATUS
} = require('./helpers/constants');
const {
    validateEmail,
    validatePhoneNumber,
    validatePasswordStrength
} = require('./helpers/validators');

const userSchema = new mongoose.Schema({
    // === اطلاعات شخصی ===
    fullName: {
        type: String,
        required: [true, 'Full name is required'],
        trim: true,
        minlength: [3, 'Full name must be at least 3 characters'],
        maxlength: [50, 'Full name cannot exceed 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        validate: {
            validator: validateEmail,
            message: props => `${props.value} is not a valid email!`
        }
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters'],
        select: false  // در کوئری‌های عادی نمایش داده نشود
    },
    phoneNumber: {
        type: String,
        required: [true, 'Phone number is required'],
        validate: {
            validator: validatePhoneNumber,
            message: props => `${props.value} is not a valid phone number!`
        }
    },
    province: {
        type: String,
        enum: PROVINCES,
        default: 'Other'
    },
    profileImage: {
        type: String,
        default: 'default-avatar.jpg',
        validate: {
            validator: (v) => !v || validateURL(v),
            message: 'Invalid image URL'
        }
    },
    
    // === اطلاعات حرفه‌ای ===
    profession: {
        type: String,
        enum: [
            'Web Developer',
            'Graphic Designer',
            'Mobile Developer',
            'Translator',
            'UI/UX Designer',
            'Video Editor',
            'Content Writer',
            'Digital Marketer',
            'Software Engineer',
            'Other'
        ],
        default: 'Other'
    },
    skills: [{
        type: String,
        trim: true,
        lowercase: true
    }],
    experience: {
        type: Number,
        min: 0,
        max: 50,
        default: 0
    },
    portfolio: [{
        title: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            trim: true
        },
        link: {
            type: String,
            validate: {
                validator: validateURL,
                message: 'Invalid portfolio URL'
            }
        },
        image: {
            type: String,
            validate: {
                validator: (v) => !v || validateURL(v),
                message: 'Invalid image URL'
            }
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    
    // === نقش و دسترسی ===
    role: {
        type: String,
        enum: Object.values(USER_ROLES),
        default: USER_ROLES.FREELANCER
    },
    permissions: [{
        type: String,
        enum: Object.values(PERMISSIONS)
    }],
    
    // === وضعیت ===
    status: {
        type: String,
        enum: Object.values(USER_STATUS),
        default: USER_STATUS.AVAILABLE
    },
    rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0,
        set: v => Math.round(v * 10) / 10
    },
    totalProjects: {
        type: Number,
        default: 0
    },
    completedProjects: {
        type: Number,
        default: 0
    },
    totalEarnings: {
        type: Number,
        default: 0
    },
    
    // === اطلاعات سیستمی ===
    lastLogin: Date,
    isActive: {
        type: Boolean,
        default: true
    },
    emailVerified: {
        type: Boolean,
        default: false
    },
    refreshToken: {
        type: String,
        select: false
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// === اعمال مدل پایه ===
new BaseModel(userSchema);

// === Virtual Properties ===
userSchema.virtual('fullProfile').get(function() {
    return {
        id: this._id,
        name: this.fullName,
        email: this.email,
        role: this.role,
        skills: this.skills,
        rating: this.rating,
        status: this.status,
        isActive: this.isActive
    };
});

// === Middleware ===
// هش کردن رمز عبور قبل از ذخیره
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// === Instance Methods ===
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.getPublicProfile = function() {
    return {
        id: this._id,
        fullName: this.fullName,
        email: this.email,
        province: this.province,
        profession: this.profession,
        skills: this.skills,
        experience: this.experience,
        rating: this.rating,
        status: this.status,
        portfolio: this.portfolio,
        profileImage: this.profileImage
    };
};

userSchema.methods.updateRating = async function() {
    // محاسبه ریتینگ بر اساس پروژه‌های تکمیل شده
    // اینجا می‌توانید منطق محاسبه ریتینگ را پیاده‌سازی کنید
    return this.save();
};

// === Static Methods ===
userSchema.statics.findByEmail = function(email) {
    return this.findOne({ email: email.toLowerCase() });
};

userSchema.statics.findActiveFreelancers = function() {
    return this.find({
        role: USER_ROLES.FREELANCER,
        isActive: true,
        status: USER_STATUS.AVAILABLE
    }).select('fullName email profession skills rating');
};

userSchema.statics.findByRole = function(role) {
    return this.find({ role, isActive: true });
};

userSchema.statics.getTopRated = function(limit = 10) {
    return this.find({
        isActive: true,
        rating: { $gt: 0 }
    })
    .sort({ rating: -1, completedProjects: -1 })
    .limit(limit)
    .select('fullName profession skills rating');
};

// === Indexes ===
userSchema.index({ email: 1 });
userSchema.index({ role: 1, status: 1 });
userSchema.index({ skills: 1 });
userSchema.index({ rating: -1 });

const User = mongoose.model('User', userSchema);

// === Hooks after model creation ===
User.on('index', function(error) {
    if (error) {
        console.error('User model index error:', error);
    }
});

module.exports = User;