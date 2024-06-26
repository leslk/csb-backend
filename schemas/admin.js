const mongoose = require('mongoose');

const admin = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: false },
    isSuperAdmin: { type: Boolean, required: true },
    status: { type: String, required: true },
    createPasswordToken: { type: String, required: false },
    forgetPasswordToken: { type: String, required: false },
});

module.exports = mongoose.model('Admin', admin);