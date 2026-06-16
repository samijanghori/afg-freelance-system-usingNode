// controllers/messageController.js
const { Message, User } = require('../models');

// ============================
// ارسال پیام
// ============================
exports.sendMessage = async (req, res) => {
    try {
        const { receiver, subject, content, parentMessage } = req.body;

        // بررسی وجود گیرنده
        const receiverUser = await User.findById(receiver);
        if (!receiverUser) {
            return res.status(404).json({
                success: false,
                message: 'Receiver not found'
            });
        }

        const message = new Message({
            sender: req.user.id,
            receiver,
            subject,
            content,
            parentMessage
        });

        await message.save();

        // populate sender info
        await message.populate('sender', 'fullName email');
        await message.populate('receiver', 'fullName email');

        res.status(201).json({
            success: true,
            data: message
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// ============================
// دریافت پیام‌های دریافتی
// ============================
exports.getInbox = async (req, res) => {
    try {
        const messages = await Message.find({
            receiver: req.user.id,
            isDeletedByReceiver: false
        })
            .populate('sender', 'fullName email profileImage')
            .populate('receiver', 'fullName email')
            .populate('parentMessage')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: messages.length,
            data: messages
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ============================
// دریافت پیام‌های ارسالی
// ============================
exports.getSent = async (req, res) => {
    try {
        const messages = await Message.find({
            sender: req.user.id,
            isDeletedBySender: false
        })
            .populate('sender', 'fullName email')
            .populate('receiver', 'fullName email')
            .populate('parentMessage')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: messages.length,
            data: messages
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ============================
// خواندن پیام
// ============================
exports.readMessage = async (req, res) => {
    try {
        const message = await Message.findById(req.params.id);

        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Message not found'
            });
        }

        // فقط گیرنده می‌تواند پیام را بخواند
        if (message.receiver.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to read this message'
            });
        }

        message.isRead = true;
        message.readAt = new Date();
        await message.save();

        res.json({
            success: true,
            data: message
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ============================
// حذف پیام
// ============================
exports.deleteMessage = async (req, res) => {
    try {
        const message = await Message.findById(req.params.id);

        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Message not found'
            });
        }

        // کاربر فقط می‌تواند پیام خود را حذف کند
        if (message.sender.toString() === req.user.id) {
            message.isDeletedBySender = true;
        } else if (message.receiver.toString() === req.user.id) {
            message.isDeletedByReceiver = true;
        } else {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this message'
            });
        }

        // اگر هر دو طرف حذف کرده باشند، پیام را به طور کامل حذف کن
        if (message.isDeletedBySender && message.isDeletedByReceiver) {
            await message.deleteOne();
            return res.json({
                success: true,
                message: 'Message deleted permanently'
            });
        }

        await message.save();

        res.json({
            success: true,
            message: 'Message deleted'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};