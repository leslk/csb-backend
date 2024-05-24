const multer = require("multer");
const fs = require("fs");
const imagesDir = "./images";
const ErrorHandler = require("../models/errorHandler");
const { v4: uuidv4 } = require("uuid");

// Create the images directory if it doesn't exist
if (fs.existsSync(imagesDir)) {
  console.log("Dossier image déjà créé");
} else {
  fs.mkdir(imagesDir, (err) => {
    if (err) {
      return new ErrorHandler(
        500,
        "Error creating the images directory!"
      );
    }
    console.log("images directory created successfully!");
  });
}

// Set files extensions
const MIME_TYPES = {
  "image/jpg": "jpg",
  "image/jpeg": "jpg",
  "image/png": "png",
};

// Multer configuration for handling image
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, imagesDir);
  },

  // Set filename
  filename: (req, file, callback) => {
    // Generate a unique name for the file
    const name = uuidv4();
    // Get the file extension from MIME_TYPES
    const extension = MIME_TYPES[file.mimetype];
    // Generate the filename with extension
    const filename = name + "." + extension;
    callback(null, filename);
  },
});

module.exports = multer({ storage: storage }).single("image");
