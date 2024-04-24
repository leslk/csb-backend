const mongoose = require("mongoose");

const tournamentHistory = new mongoose.Schema({
  content: { type: String, required: false },
  images: { type: [String], required: false },
  title: { type: String, required: false },
});

const participant = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phoneNumber: { type: String, required: true },
});

const tournament = new mongoose.Schema({
  startDate: { type: Date, required: true },
  location: { type: String, required: true },
  availablePlaces: { type: Number, required: true },
  participants: { type: [participant], required: true },
  price: { type: Number, required: true },
  description: { type: String, required: false },
  status: { type: String, required: true },
  tournamentHistory: { type: tournamentHistory, required: true },
});

module.exports = mongoose.model("Tournament", tournament);
