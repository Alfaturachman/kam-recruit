const express = require('express');
const router = express.Router();
const { uploadExcel } = require('../middlewares/upload');
const { importGlints, getApplicants, getApplicantDetail, bulkUpdateSortir } = require('../controllers/applicantController');

router.post('/import', uploadExcel.single('file'), importGlints);
router.post('/bulk-sortir', bulkUpdateSortir);
router.get('/', getApplicants);
router.get('/:id', getApplicantDetail);

module.exports = router;
