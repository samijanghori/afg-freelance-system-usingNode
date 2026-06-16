// models/index.js
const mongoose = require('mongoose');
const User = require('./User');
const Project = require('./Project');
const Task = require('./Task');
const Team = require('./Team');
const Report = require('./Report');

module.exports = {
    User,
    Project,
    Task,
    Team,
    Report
};