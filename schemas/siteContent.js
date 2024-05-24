const mongoose = require("mongoose");

const contact = new mongoose.Schema({
  instagram: { type: String, required: true },
  tiktok: { type: String, required: true },
  facebook: { type: String, required: true },
  email: { type: String, required: true },
});

const member = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  role: { type: String, required: true },
  image: { type: String, required: true },
});

const siteContent = new mongoose.Schema({
  aboutUs: { type: String, required: true },
  contact: { type: contact, required: false },
  members: { type: [member], required: false },
});

module.exports = mongoose.model("SiteContent", siteContent);
