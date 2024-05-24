const express = require("express");
const router = express.Router();

const adminCtrl = require("../controllers/admin");
const auth = require("../middleware/auth");

router.post("/", adminCtrl.createAdmin);
router.post("/login", adminCtrl.login);
router.get("/", auth, adminCtrl.getAdmins);
router.put("/:id", auth, adminCtrl.updateAdmin);
router.post("/:id/password", adminCtrl.createPassword);
router.put("/:id/password", auth, adminCtrl.updatePassword);
router.delete("/:id", auth, adminCtrl.deleteAdmin);
router.get("/logout", auth, adminCtrl.logout);
router.get("/checkToken/:id/:token", adminCtrl.checkToken);
router.post("/forgetPassword", adminCtrl.forgetPassword);
router.put("/:id/resetPassword", adminCtrl.resetPassword);
router.post("/:id/sendInvitation", auth, adminCtrl.sendInvitation);

module.exports = router;
