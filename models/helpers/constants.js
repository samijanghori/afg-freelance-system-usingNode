// models/helpers/constants.js

// استان‌های افغانستان
const PROVINCES = [
    'Kabul',
    'Herat', 
    'Mazar-e-Sharif',
    'Kandahar',
    'Balkh',
    'Nangarhar',
    'Ghor',
    'Sarpol',
    'Jawzjan',
    'Other'
];

// نقش‌های کاربران
const USER_ROLES = {
    ADMIN: 'admin',
    PROJECT_MANAGER: 'project_manager',
    TEAM_LEADER: 'team_leader',
    FREELANCER: 'freelancer',
    CLIENT: 'client'
};

// مجوزها
const PERMISSIONS = {
    MANAGE_USERS: 'manage_users',
    MANAGE_PROJECTS: 'manage_projects',
    MANAGE_TASKS: 'manage_tasks',
    VIEW_REPORTS: 'view_reports',
    MANAGE_TEAM: 'manage_team',
    VIEW_ANALYTICS: 'view_analytics',
    MANAGE_PAYMENTS: 'manage_payments'
};

// وضعیت کاربر
const USER_STATUS = {
    AVAILABLE: 'available',
    BUSY: 'busy',
    OFFLINE: 'offline',
    ON_LEAVE: 'on_leave'
};

// وضعیت پروژه
const PROJECT_STATUS = {
    PENDING: 'pending',
    IN_PROGRESS: 'in_progress',
    REVIEW: 'review',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    ON_HOLD: 'on_hold'
};

// وضعیت وظیفه
const TASK_STATUS = {
    TODO: 'todo',
    IN_PROGRESS: 'in_progress',
    REVIEW: 'review',
    DONE: 'done',
    BLOCKED: 'blocked'
};

// اولویت‌ها
const PRIORITY = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    URGENT: 'urgent'
};

module.exports = {
    PROVINCES,
    USER_ROLES,
    PERMISSIONS,
    USER_STATUS,
    PROJECT_STATUS,
    TASK_STATUS,
    PRIORITY
};