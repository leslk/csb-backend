const express = require("express");
require("dotenv").config({ path: "./config/.env" });
const path = require("path");
const cookieParser = require("cookie-parser");
const cors = require("cors");

// Routes
const adminRoutes = require("./routes/admin");
const tournamentRoutes = require("./routes/tournament");
const uploadRoutes = require("./routes/upload");
const siteContentRoutes = require("./routes/siteContent");
const contactRoutes = require("./routes/contact");

// Express app
const app = express();
app.use(express.json());
app.use(cookieParser());

// CORS
app.use(
  cors({
    origin: process.env.FRONT_HOST,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Serve static files
app.use("/images", express.static(path.join(__dirname, "images")));

app.use("/api/admins", adminRoutes);
app.use("/api/tournaments", tournamentRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/siteContent", siteContentRoutes);
app.use("/api/contact", contactRoutes);

module.exports = app;
