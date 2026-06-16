// routes/messageRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    sendMessage,
    getInbox,
    getSent,
    readMessage,
    deleteMessage
} = require('../controllers/messageController');

// ============================
// مسیرها
// ============================
router.post('/', protect, sendMessage);
router.get('/inbox', protect, getInbox);
router.get('/sent', protect, getSent);
router.put('/:id/read', protect, readMessage);
router.delete('/:id', protect, deleteMessage);

module.exports = router;