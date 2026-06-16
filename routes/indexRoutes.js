// routes/indexRoutes.js
const express = require('express');
const router = express.Router();
const { User } = require('../models');

// داده‌های نمونه (فعلاً از دیتابیس نمی‌خوانیم)
const membersData = [
    {
        id: 1,
        name: 'Ahmad Shah Rahmani',
        profession: 'Web Developer',
        experience: 5,
        location: 'Kabul',
        status: 'Available'
    },
    {
        id: 2,
        name: 'Maryam Hosseini',
        profession: 'Graphic Designer',
        experience: 4,
        location: 'Herat',
        status: 'Available'
    },
    {
        id: 3,
        name: 'Rahman Noori',
        profession: 'Content Writer',
        experience: 3,
        location: 'Mazar-i-Sharif',
        status: 'Available'
    },
    {
        id: 4,
        name: 'Fatema Ahmadi',
        profession: 'Digital Marketer',
        experience: 6,
        location: 'Kandahar',
        status: 'Available'
    },
    {
        id: 5,
        name: 'Hamed Rezaei',
        profession: 'Video Editor',
        experience: 4,
        location: 'Balkh',
        status: 'Available'
    },
    {
        id: 6,
        name: 'Nasim Karimi',
        profession: 'Translator',
        experience: 7,
        location: 'Nangarhar',
        status: 'Available'
    }
];

// === صفحه اصلی ===
router.get('/', async (req, res) => {
    try {
        // در آینده می‌توانید از دیتابیس بخوانید
        // const members = await User.findActiveFreelancers();
        
        res.render('index', {
            title: 'HomePage',
            members: membersData
        });
    } catch (error) {
        console.error('Error fetching members:', error);
        res.status(500).render('error', {
            title: 'Error',
            message: 'Unable to load members'
        });
    }
});

// === صفحه درباره ما ===
router.get('/about', (req, res) => {
    res.render('about', {
        title: 'OurTeam'
    });
});

// === صفحه ایجاد عضو ===
router.get('/create/member', (req, res) => {
    res.render('create_member', {
        title: 'CreateMember'
    });
});

// === API برای دریافت اعضا (به صورت JSON) ===
router.get('/api/members', (req, res) => {
    res.json({
        success: true,
        data: membersData
    });
});

module.exports = router;