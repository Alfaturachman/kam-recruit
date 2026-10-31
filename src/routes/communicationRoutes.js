const express = require('express');
const router = express.Router();
const { getCandidateWaLink, updateInterviewStatus } = require('../controllers/communicationController');
const { submitHrdAssessment } = require('../controllers/interviewController');

router.get('/:id/wa-link', getCandidateWaLink);
router.put('/:id/interview-status', updateInterviewStatus);
router.put('/:id/hrd-assessment', submitHrdAssessment);

module.exports = router;
