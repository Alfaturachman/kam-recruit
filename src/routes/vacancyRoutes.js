const express = require('express');
const router = express.Router();
const {
  getAllVacancies,
  getVacancyById,
  createVacancy,
  updateVacancy,
  updateVacancyStatus,
  deleteVacancy
} = require('../controllers/vacancyController');

router.get('/', getAllVacancies);
router.get('/:id', getVacancyById);
router.post('/', createVacancy);
router.put('/:id', updateVacancy);
router.patch('/:id/status', updateVacancyStatus);
router.delete('/:id', deleteVacancy);

module.exports = router;

