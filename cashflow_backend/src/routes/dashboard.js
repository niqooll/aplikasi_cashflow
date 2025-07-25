const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.get('/summary', dashboardController.getSummary);
router.get('/pie-chart', dashboardController.getCategoryPieChart);
router.get('/budgets', dashboardController.getBudgetsSummary);

module.exports = router;