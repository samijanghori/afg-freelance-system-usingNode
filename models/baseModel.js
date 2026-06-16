// models/baseModel.js
const mongoose = require('mongoose');

class BaseModel {
    constructor(schema, options = {}) {
        schema.add({
            isDeleted: {
                type: Boolean,
                default: false,
                select: false
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

        // Middleware برای حذف نرم
        schema.pre('find', function() {
            this.where({ isDeleted: false });
        });

        schema.pre('findOne', function() {
            this.where({ isDeleted: false });
        });

        schema.pre('findById', function() {
            this.where({ isDeleted: false });
        });

        schema.pre('save', function(next) {
            this.updatedAt = new Date();
            next();
        });

        // متدهای نمونه
        schema.methods.softDelete = async function(userId = null) {
            this.isDeleted = true;
            this.deletedAt = new Date();
            if (userId) this.updatedBy = userId;
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

        schema.statics.findWithDeleted = function() {
            return this.find().select('+isDeleted +deletedAt');
        };

        return schema;
    }
}

module.exports = BaseModel;