const mongoose = require('mongoose');

const member = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    image: {type: String, required: true},
});

module.exports = mongoose.model('Member', member);