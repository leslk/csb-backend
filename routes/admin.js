const express = require('express');
const router = express.Router();

const adminCtrl = require('../controllers/admin');

router.post('/signup', adminCtrl.createAdmin);
router.post('/login', adminCtrl.login);
router.get('/', adminCtrl.getAdmins);
router.put('/:id/update', adminCtrl.updateAdmin);
router.post('/:id/password/create', adminCtrl.createPassword);
router.put('/:id/password/update', adminCtrl.updatePassword);
router.delete('/deleteAdmin/:id', adminCtrl.deleteAdmin);

module.exports = router;