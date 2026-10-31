const express = require('express');
const router = express.Router();
const { getStage1Recap, getStage2Recap, exportRecapExcel } = require('../controllers/recapController');

router.get('/stage1', getStage1Recap);
router.get('/stage2', getStage2Recap);
router.get('/export-excel', exportRecapExcel);

module.exports = router;

