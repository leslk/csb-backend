const ErrorHandler = require("../models/errorHandler");
const fs = require("fs");

/**
 * @conteoller upload
 * @description Upload an image
 */
exports.upload = async (req, res) => {
  try {
    // Check if there is a file in the request
    if (!req.file) {
      return res.status(400).json({ message: "Aucun fichier téléchargé." });
    }

    // Get the image URL
    const imageUrl =
      req.protocol + "://" + req.get("host") + "/" + req.file.path;

    // Return the image URL
    return res.status(200).json({ imageUrl: imageUrl });
  } catch (error) {
    return new ErrorHandler(error.status, error.message).send(res);
  }
};

/**
 * @controller removeUploadedImage
 * @description Remove an uploaded image 
 */
exports.removeUploadedImage = async (req, res) => {
  try {
    // Get the imageUrl from the request body
    const imageUrl = req.query.imageUrl;
    // Get the filename from the imageUrl
    const filename = imageUrl.split("/images/")[1];

    // Check if the file exists
    fs.unlink(`images/${filename}`, (error) => {
      if (error) {
        return new ErrorHandler(
          500,
          "Erreur lors de la suppression du fichier"
        ).send(res);
      }
      // Return a success message with the filename
      return res.status(200).json(imageUrl);
    });
  } catch (error) {
    return new ErrorHandler(error.status, error.message).send(res);
  }
};
