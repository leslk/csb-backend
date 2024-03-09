const mongoose = require('mongoose');

const contact = new mongoose.Schema({
    email: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    instagramLink: { type: String, required: true },
    facebookLink: { type: String, required: true },
    tiktokLink: { type: String, required: true },
});

module.exports = mongoose.model('Contact', contact);