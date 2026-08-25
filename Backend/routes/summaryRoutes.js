const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getMonthlySummary, getSummary, getAlerts } = require('../controllers/summaryController');

router.use(authMiddleware);

router.get('/monthly', getMonthlySummary);
router.get('/alerts', getAlerts);
router.get('/', getSummary);

module.exports = router;
