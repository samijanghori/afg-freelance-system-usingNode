// controllers/notificationController.js
const { Notification } = require('../models');

// ============================
// دریافت نوتیفیکیشن‌ها
// ============================
exports.getNotifications = async (req, res) => {
    try {
        const { page = 1, limit = 20, unreadOnly = false } = req.query;

        const query = { user: req.user.id };
        if (unreadOnly === 'true') {
            query.isRead = false;
        }

        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Notification.countDocuments(query);
        const unreadCount = await Notification.countDocuments({
            user: req.user.id,
            isRead: false
        });

        res.json({
            success: true,
            data: {
                notifications,
                unreadCount,
                total,
                page: parseInt(page),
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ============================
// = دریافت تعداد نوتیفیکیشن‌های خوانده نشده
// ============================
exports.getUnreadCount = async (req, res) => {
    try {
        const count = await Notification.countDocuments({
            user: req.user.id,
            isRead: false
        });

        res.json({
            success: true,
            data: { unreadCount: count }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ============================
// = خواندن یک نوتیفیکیشن
// ============================
exports.readNotification = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        if (notification.user.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        notification.isRead = true;
        notification.readAt = new Date();
        await notification.save();

        res.json({
            success: true,
            data: notification
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ============================
// = خواندن همه نوتیفیکیشن‌ها
// ============================
exports.readAllNotifications = async (req, res) => {
    try {
        await Notification.updateMany(
            { user: req.user.id, isRead: false },
            { isRead: true, readAt: new Date() }
        );

        res.json({
            success: true,
            message: 'All notifications marked as read'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ============================
// = حذف نوتیفیکیشن
// ============================
exports.deleteNotification = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        if (notification.user.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        await notification.deleteOne();

        res.json({
            success: true,
            message: 'Notification deleted'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ============================
// = ایجاد نوتیفیکیشن (برای استفاده در سایر بخش‌ها)
// ============================
exports.createNotification = async (userId, type, title, message, link = null, metadata = {}) => {
    try {
        const notification = new Notification({
            user: userId,
            type,
            title,
            message,
            link,
            metadata
        });
        await notification.save();

        // در آینده می‌توانید از WebSocket برای ارسال نوتیفیکیشن لحظه‌ای استفاده کنید

        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
        return null;
    }
};