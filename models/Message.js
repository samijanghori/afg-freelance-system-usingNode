// models/Message.js
const mongoose = require('mongoose');
const BaseModel = require('./baseModel');

const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    subject: {
        type: String,
        trim: true,
        maxlength: [100, 'Subject cannot exceed 100 characters']
    },
    content: {
        type: String,
        required: [true, 'Message content is required'],
        maxlength: [5000, 'Message cannot exceed 5000 characters']
    },
    isRead: {
        type: Boolean,
        default: false
    },
    readAt: Date,
    parentMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    },
    attachments: [{
        name: String,
        url: String,
        size: Number,
        type: String
    }],
    isDeletedBySender: {
        type: Boolean,
        default: false
    },
    isDeletedByReceiver: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

new BaseModel(messageSchema);

// Indexes
messageSchema.index({ sender: 1, receiver: 1 });
messageSchema.index({ isRead: 1 });
messageSchema.index({ createdAt: -1 });

const Message = mongoose.model('Message', messageSchema);
module.exports = Message;