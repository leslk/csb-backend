const express = require("express");
require("dotenv").config({ path: "./config/.env" });
const path = require("path");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const adminRoutes = require("./routes/admin");
const tournamentRoutes = require("./routes/tournament");
const uploadRoutes = require("./routes/upload");
const siteContentRoutes = require("./routes/siteContent");

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use("/images", express.static(path.join(__dirname, "images")));

app.use("/api/admins", adminRoutes);
app.use("/api/tournaments", tournamentRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/siteContent", siteContentRoutes);

module.exports = app;
