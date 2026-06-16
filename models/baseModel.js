// models/baseModel.js
const mongoose = require('mongoose');

/**
 * مدل پایه برای همه مدل‌ها
 * شامل فیلدهای مشترک و قابلیت‌های عمومی
 */
class BaseModel {
    constructor(schema, options = {}) {
        // افزودن فیلدهای مشترک به همه مدل‌ها
        schema.add({
            isDeleted: {
                type: Boolean,
                default: false,
                select: false  // در کوئری‌های عادی نمایش داده نشود
            },
            deletedAt: {
                type: Date,
                default: null,
                select: false
            },
            createdBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                select: false
            },
            updatedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                select: false
            }
        });

        // Middleware برای حذف نرم (Soft Delete)
        schema.pre('find', function() {
            this.where({ isDeleted: false });
        });

        schema.pre('findOne', function() {
            this.where({ isDeleted: false });
        });

        schema.pre('findById', function() {
            this.where({ isDeleted: false });
        });

        // Middleware برای به‌روزرسانی خودکار
        schema.pre('save', function(next) {
            this.updatedAt = new Date();
            next();
        });

        // متدهای عمومی
        schema.methods.softDelete = async function(userId) {
            this.isDeleted = true;
            this.deletedAt = new Date();
            this.updatedBy = userId;
            return this.save();
        };

        schema.methods.restore = async function() {
            this.isDeleted = false;
            this.deletedAt = null;
            return this.save();
        };

        // متدهای استاتیک
        schema.statics.findActive = function() {
            return this.find({ isDeleted: false });
        };

        schema.statics.findByIdAndRestore = async function(id) {
            return this.findByIdAndUpdate(id, {
                isDeleted: false,
                deletedAt: null
            }, { new: true });
        };

        return schema;
    }
}

module.exports = BaseModel;