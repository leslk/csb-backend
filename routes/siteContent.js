const express = require("express");
const router = express.Router();

const siteContentCtrl = require("../controllers/siteContent");

router.get("/", siteContentCtrl.getSiteContent);
router.put("/", siteContentCtrl.updateSiteContent);
router.post("/", siteContentCtrl.createSiteContent);

module.exports = router;
