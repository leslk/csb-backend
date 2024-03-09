const express = require('express');
require("dotenv").config({path : "./config/.env"});
const path = require("path");
const auth = require('./middleware/auth');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const adminRoutes = require("./routes/admin");
// const protagonistRoutes = require("./routes/protagonist");
// const universeRoutes = require("./routes/universe");
// const messageRoutes = require("./routes/message");
// const userRoutes = require("./routes/user");
// const talkRoutes = require("./routes/talk");


const app = express();
app.use(express.json());
app.use(cookieParser());

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true, 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], 
    allowedHeaders: ['Content-Type', 'Authorization'], 
  }));



// app.use("/images", express.static(path.join(__dirname, "images")));

app.use(auth);
app.use("/api/admins", adminRoutes);
// app.use("/api/universes", universeRoutes);
// app.use("/api/universes", protagonistRoutes);
// app.use("/api/users", userRoutes);
// app.use("/api/talks", messageRoutes);
// app.use("/api/talks", talkRoutes);

module.exports = app;