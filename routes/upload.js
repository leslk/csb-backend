const express = require("express");
const router = express.Router();
const uploadCtrl = require("../controllers/upload");
const multer = require("../middleware/multer");

router.post("/", multer, uploadCtrl.upload);
router.delete("/", uploadCtrl.removeUploadedImage);

module.exports = router;
