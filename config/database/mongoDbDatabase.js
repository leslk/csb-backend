const mongoose = require("mongoose");

const dbUrl = "mongodb://localhost:27017/CSB";

/**
 * Connect to MongoDB database
 * @description Connect to MongoDB database
 */
const connection = mongoose
  .connect(
    dbUrl,
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => {
    console.log("mongoDB connected successfully!");
  })
  .catch(() => console.log("mongoDB connection failed!"));

exports.databaseConnection = connection;
