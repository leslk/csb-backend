const mongoose = require('mongoose');
const Member = require('./member');
const Tournament = require('./tournament');
const Content = require('./content');

const siteContent = new mongoose.Schema({
    description: { type: String, required: true },
    contact : { type: Content, required: false },
    members: { type: [Member], required: false },
    tournaments: { type: [Tournament], required: false }
});

module.exports = mongoose.model('SiteContent', siteContent);