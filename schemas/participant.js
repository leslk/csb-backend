const mongoose = require('mongoose');

const participant = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phoneNumber: {type: String, required: true},
});

module.exports = mongoose.model('Participant', participant);