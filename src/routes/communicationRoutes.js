const express = require('express');
const router = express.Router();
const { getCandidateWaLink, updateInterviewStatus, bulkUpdateInterviewSchedule } = require('../controllers/communicationController');
const { submitHrdAssessment } = require('../controllers/interviewController');

router.put('/bulk/interview-schedule', bulkUpdateInterviewSchedule);
router.get('/:id/wa-link', getCandidateWaLink);
router.put('/:id/interview-status', updateInterviewStatus);
router.put('/:id/hrd-assessment', submitHrdAssessment);

module.exports = router;
