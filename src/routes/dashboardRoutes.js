const express = require('express');
const router = express.Router();
const {
  getDashboardMetrics,
  getMonthlyStats
} = require('../controllers/dashboardController');
const { getAllVacancies } = require('../controllers/vacancyController');

router.get('/metrics', getDashboardMetrics);
router.get('/vacancies', getAllVacancies);
router.get('/monthly-stats', getMonthlyStats);

module.exports = router;
