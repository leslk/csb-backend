const mongoose = require('mongoose');
const team = require('./team');

const tournament = new mongoose.Schema({
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    location: { type: String, required: true },
    teams: { type: [team], required: true },
    placeAvailable: { type: Number, required: true },
    totalPlace: { type: Number, required: true },
});