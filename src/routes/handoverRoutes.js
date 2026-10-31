const express = require('express');
const router = express.Router();
const { downloadBundleZip, submitToPartner } = require('../controllers/handoverController');

router.get('/bundle-zip', downloadBundleZip);
router.post('/submit-to-partner', submitToPartner);

module.exports = router;

