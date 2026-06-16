// routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    getNotifications,
    getUnreadCount,
    readNotification,
    readAllNotifications,
    deleteNotification
} = require('../controllers/notificationController');

// ============================
// مسیرها
// ============================
router.get('/', protect, getNotifications);
router.get('/unread-count', protect, getUnreadCount);
router.put('/:id/read', protect, readNotification);
router.put('/read-all', protect, readAllNotifications);
router.delete('/:id', protect, deleteNotification);

module.exports = router;